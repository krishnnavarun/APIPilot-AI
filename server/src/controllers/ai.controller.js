import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import Endpoint from '../models/endpoint.model.js';
import TestCase from '../models/testcase.model.js';

/**
 * Generate test cases from endpoint using AI
 */
export const generateTestCases = async (req, res, next) => {
  try {
    const { endpointId, projectId, count = 5 } = req.body;

    if (!endpointId || !projectId) {
      return res.status(400).json({ message: 'Endpoint ID and Project ID are required' });
    }

    const endpoint = await Endpoint.findById(endpointId);
    if (!endpoint) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    // Try Gemini AI if API Key is configured
    if (env.geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
        const prompt = `You are a professional software testing AI. Generate ${count} API test cases for the following endpoint:
Name: ${endpoint.name}
Method: ${endpoint.method}
URL: ${endpoint.url}
Description: ${endpoint.description || 'No description provided'}
Headers: ${JSON.stringify(Object.fromEntries(endpoint.headers || []))}
Query Parameters: ${JSON.stringify(Object.fromEntries(endpoint.queryParams || []))}
Body: ${JSON.stringify(endpoint.body)}
Expected Response Status: ${endpoint.responseStatus || 200}
Expected Response Body: ${JSON.stringify(endpoint.response)}

Return the output as a valid JSON array of test cases. Each test case MUST follow this JSON schema:
{
  "name": "string (the name of the test case)",
  "description": "string (the description of what is tested)",
  "requestHeaders": { "key": "value" },
  "requestQueryParams": { "key": "value" },
  "requestBody": any,
  "expectedStatus": number,
  "assertions": [
    {
      "type": "statusCode" | "bodyContains" | "headerExists" | "responseTime",
      "value": "string",
      "operator": "equals" | "contains" | "greaterThan" | "lessThan" | "exists",
      "expectedValue": "string"
    }
  ]
}
IMPORTANT: Output ONLY a JSON array. Do not include markdown code block syntax (like \`\`\`json) or any explanations.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        let text = response.text.trim();
        if (text.startsWith('```')) {
          text = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }

        const generatedCases = JSON.parse(text);
        const savedTestCases = [];

        for (const item of generatedCases) {
          const testCase = new TestCase({
            name: item.name,
            description: item.description,
            endpoint: endpointId,
            project: projectId,
            owner: req.userId,
            requestHeaders: new Map(Object.entries(item.requestHeaders || {})),
            requestQueryParams: new Map(Object.entries(item.requestQueryParams || {})),
            requestBody: item.requestBody,
            expectedStatus: item.expectedStatus || 200,
            assertions: item.assertions || [],
          });
          await testCase.save();
          savedTestCases.push(testCase.toSafeJSON());
        }

        return res.status(201).json({
          message: `Generated ${savedTestCases.length} test cases using Gemini AI`,
          testCases: savedTestCases,
        });
      } catch (error) {
        console.error('Gemini test case generation failed, falling back to mock:', error);
      }
    }

    // Fallback: Generate test cases based on endpoint method and structure
    const testCases = [];
    const testScenarios = {
      GET: [
        'Should return 200 OK for valid request',
        'Should handle missing query parameters gracefully',
        'Should return 404 for non-existent resource',
      ],
      POST: [
        'Should create resource with valid data',
        'Should validate required fields',
        'Should handle duplicate submissions',
        'Should reject invalid JSON',
      ],
      PUT: [
        'Should update entire resource',
        'Should validate all required fields',
        'Should return 404 for non-existent resource',
      ],
      PATCH: [
        'Should partially update resource',
        'Should preserve unmodified fields',
        'Should validate updated fields',
      ],
      DELETE: [
        'Should delete existing resource',
        'Should return 404 for non-existent resource',
        'Should prevent unauthorized deletion',
      ],
    };

    const scenarios = testScenarios[endpoint.method] || [];
    const selectedScenarios = scenarios.slice(0, count);

    for (const scenario of selectedScenarios) {
      const testCase = new TestCase({
        name: `${endpoint.method} ${endpoint.name} - ${scenario}`,
        description: scenario,
        endpoint: endpointId,
        project: projectId,
        owner: req.userId,
        requestHeaders: new Map(endpoint.headers),
        requestQueryParams: new Map(endpoint.queryParams),
        expectedStatus: 200,
        assertions: [
          {
            type: 'statusCode',
            operator: 'equals',
            expectedValue: '200',
          },
          {
            type: 'responseTime',
            operator: 'lessThan',
            expectedValue: '5000',
          },
        ],
      });

      await testCase.save();
      testCases.push(testCase.toSafeJSON());
    }

    res.status(201).json({
      message: `Generated ${testCases.length} mock test cases`,
      testCases,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate mock data for request body based on endpoint structure
 */
export const generateMockData = async (req, res, next) => {
  try {
    const { endpointId } = req.body;

    if (!endpointId) {
      return res.status(400).json({ message: 'Endpoint ID is required' });
    }

    const endpoint = await Endpoint.findById(endpointId);
    if (!endpoint) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    const inferredMockData = inferMockBody(endpoint);
    if (inferredMockData) {
      return res.status(200).json({
        endpoint: endpoint.toSafeJSON(),
        mockData: inferredMockData,
      });
    }

    // Try Gemini AI if API Key is configured
    if (env.geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
        const prompt = `Generate realistic mock request body JSON data for this API endpoint:
Name: ${endpoint.name}
Method: ${endpoint.method}
URL: ${endpoint.url}
Description: ${endpoint.description || 'No description provided'}
Request Body Structure: ${JSON.stringify(endpoint.body)}

Use field names that match the route and description exactly. Examples:
- For register/signup routes, use fullName, email, password, confirmPassword.
- For login/signin routes, use email and password.
- For product creation routes, use name, description, price, sku, stock.
- For order/checkout routes, use userId, items, shippingAddress, paymentMethod.

Return only the mock JSON object. Do not include markdown code block syntax or explanations.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        let text = response.text.trim();
        if (text.startsWith('```')) {
          text = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }

        const mockData = JSON.parse(text);
        return res.status(200).json({
          endpoint: endpoint.toSafeJSON(),
          mockData,
        });
      } catch (error) {
        console.error('Gemini mock data generation failed, falling back to rule-based:', error);
      }
    }

    // Fallback: Generate mock data based on endpoint body structure
    const mockData = generateMockBody(endpoint.body);

    res.status(200).json({
      endpoint: endpoint.toSafeJSON(),
      mockData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze API for security vulnerabilities
 */
export const analyzeSecurityVulnerabilities = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Get all endpoints in project
    const endpoints = await Endpoint.find({
      project: projectId,
      isActive: true,
    });

    if (env.geminiApiKey && endpoints.length > 0) {
      try {
        const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
        const prompt = `You are a cyber security expert. Analyze the following API endpoints in a project for potential security vulnerabilities (such as missing authorization, URL parameter leaks, content type validation issues, rate limiting recommendation, etc.):
${endpoints.map(e => `
- Endpoint: ${e.name}
  Method: ${e.method}
  URL: ${e.url}
  Headers: ${JSON.stringify(Object.fromEntries(e.headers || []))}
  QueryParams: ${JSON.stringify(Object.fromEntries(e.queryParams || []))}
  Body: ${JSON.stringify(e.body)}
`).join('\n')}

Return a JSON object matching this schema:
{
  "securityScore": number (from 0 to 100, where 100 is fully secure),
  "vulnerabilityCount": number,
  "vulnerabilities": [
    {
      "severity": "high" | "medium" | "low",
      "endpoint": "string (endpoint name or method + URL)",
      "issue": "string (vulnerability description)",
      "recommendation": "string (remediation advice)"
    }
  ]
}
IMPORTANT: Return ONLY valid JSON. Do not include markdown code block formatting or notes outside JSON.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        let text = response.text.trim();
        if (text.startsWith('```')) {
          text = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }

        const analysis = JSON.parse(text);
        return res.status(200).json({
          projectId,
          ...analysis,
        });
      } catch (error) {
        console.error('Gemini security analysis failed, falling back to static analysis:', error);
      }
    }

    // Static / Rule-based check fallback
    const vulnerabilities = [];

    for (const endpoint of endpoints) {
      // Check for common security issues
      if (!endpoint.headers || !Object.fromEntries(endpoint.headers).hasOwnProperty('Authorization')) {
        vulnerabilities.push({
          severity: 'high',
          endpoint: endpoint.name,
          issue: 'Missing Authorization header',
          recommendation: 'Add authorization validation to secure this endpoint',
        });
      }

      if (endpoint.method !== 'GET' && !endpoint.headers?.get('Content-Type')) {
        vulnerabilities.push({
          severity: 'medium',
          endpoint: endpoint.name,
          issue: 'Missing Content-Type header',
          recommendation: 'Specify Content-Type for request body parsing rules',
        });
      }

      if (endpoint.url.includes('password') || endpoint.url.includes('secret')) {
        vulnerabilities.push({
          severity: 'high',
          endpoint: endpoint.name,
          issue: 'Sensitive data leaks in URL path/query parameters',
          recommendation: 'Move sensitive credentials to secure POST request body or Auth headers',
        });
      }
    }

    res.status(200).json({
      projectId,
      vulnerabilityCount: vulnerabilities.length,
      vulnerabilities,
      securityScore: Math.max(0, 100 - vulnerabilities.length * 10),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Generate mock data from schema
 */
function inferMockBody(endpoint) {
  if (!['POST', 'PUT', 'PATCH'].includes(endpoint.method)) return null;

  const signature = `${endpoint.name || ''} ${endpoint.url || ''} ${endpoint.description || ''}`.toLowerCase();

  if (signature.includes('register') || signature.includes('signup') || signature.includes('sign-up')) {
    return {
      fullName: 'Demo User',
      email: `demo${Date.now()}@example.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };
  }

  if (signature.includes('login') || signature.includes('signin') || signature.includes('sign-in')) {
    return {
      email: 'demo@example.com',
      password: 'Password123!',
    };
  }

  if (signature.includes('product')) {
    return {
      name: 'Demo Product',
      description: 'Sample product created from APIPilot AI',
      price: 49.99,
      sku: `DEMO-${Date.now()}`,
      stock: 25,
    };
  }

  if (signature.includes('order') || signature.includes('checkout')) {
    return {
      userId: 'demo-user-id',
      items: [
        {
          productId: 'demo-product-id',
          quantity: 2,
        },
      ],
      shippingAddress: {
        line1: '123 Demo Street',
        city: 'Mumbai',
        country: 'India',
        postalCode: '400001',
      },
      paymentMethod: 'card',
    };
  }

  return null;
}

function generateMockBody(schema) {
  if (!schema) return { id: 1, status: 'success' };

  const mockData = {};

  if (typeof schema === 'object' && schema !== null) {
    for (const [key, value] of Object.entries(schema)) {
      if (typeof value === 'string') {
        mockData[key] = `sample_${key}`;
      } else if (typeof value === 'number') {
        mockData[key] = Math.floor(Math.random() * 100);
      } else if (typeof value === 'boolean') {
        mockData[key] = true;
      } else if (Array.isArray(value)) {
        mockData[key] = [generateMockBody(value[0])];
      } else if (typeof value === 'object') {
        mockData[key] = generateMockBody(value);
      }
    }
  }

  return mockData;
}

/**
 * Generate API documentation from endpoints
 */
export const generateDocumentation = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const endpoints = await Endpoint.find({
      project: projectId,
      isActive: true,
    }).sort({ method: 1, url: 1 });

    const documentation = {
      title: `Project API Documentation`,
      version: '1.0.0',
      endpoints: endpoints.map((e) => ({
        title: e.name,
        method: e.method,
        path: e.url,
        description: e.description,
        headers: Object.fromEntries(e.headers || []),
        queryParams: Object.fromEntries(e.queryParams || []),
        requestBody: e.body,
        responseBody: e.response,
        responseStatus: e.responseStatus,
        tags: e.tags,
      })),
    };

    res.status(200).json(documentation);
  } catch (error) {
    next(error);
  }
};
