import TestCase from '../models/testcase.model.js';
import Endpoint from '../models/endpoint.model.js';
import Project from '../models/project.model.js';
import { evaluateAssertions, executeEndpointRequest } from '../services/endpoint-executor.js';

export const createTestCase = async (req, res, next) => {
  try {
    const {
      name,
      description,
      endpointId,
      projectId,
      requestHeaders,
      requestBody,
      requestQueryParams,
      expectedStatus,
      expectedResponseBody,
      assertions,
    } = req.body;

    if (!name || !endpointId || !projectId) {
      return res
        .status(400)
        .json({ message: 'Name, Endpoint ID, and Project ID are required' });
    }

    // Verify endpoint and project exist
    const endpoint = await Endpoint.findById(endpointId);
    if (!endpoint) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const testCase = new TestCase({
      name,
      description,
      endpoint: endpointId,
      project: projectId,
      owner: req.userId,
      requestHeaders: new Map(Object.entries(requestHeaders || {})),
      requestBody,
      requestQueryParams: new Map(Object.entries(requestQueryParams || {})),
      expectedStatus: expectedStatus || 200,
      expectedResponseBody,
      assertions: assertions || [],
    });

    await testCase.save();
    res.status(201).json(testCase.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const getTestCasesByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const testCases = await TestCase.find({
      project: projectId,
      isActive: true,
    })
      .populate('endpoint')
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json(testCases.map(tc => tc.toSafeJSON()));
  } catch (error) {
    next(error);
  }
};

export const getTestCasesByEndpoint = async (req, res, next) => {
  try {
    const { endpointId } = req.params;

    const endpoint = await Endpoint.findById(endpointId);
    if (!endpoint) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    const testCases = await TestCase.find({
      endpoint: endpointId,
      isActive: true,
    })
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json(testCases.map(tc => tc.toSafeJSON()));
  } catch (error) {
    next(error);
  }
};

export const runTestCase = async (req, res, next) => {
  try {
    const { id } = req.params;

    const testCase = await TestCase.findById(id).populate('endpoint');

    if (!testCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }

    const endpoint = testCase.endpoint;

    const execution = await executeEndpointRequest(endpoint, {
      overrideHeaders: Object.fromEntries(testCase.requestHeaders || []),
      overrideBody: testCase.requestBody,
      overrideQueryParams: Object.fromEntries(testCase.requestQueryParams || []),
    });
    const { allAssertionsPassed, assertionResults } = evaluateAssertions(testCase, execution);

    const status = execution.error || !allAssertionsPassed ? 'failed' : 'passed';

    testCase.lastRun = {
      status,
      duration: execution.duration,
      actualStatus: execution.actualStatus,
      actualResponse: execution.actualResponse,
      error: execution.error || (status === 'failed' ? 'Assertion failed' : null),
      timestamp: execution.timestamp,
    };
    testCase.runCount += 1;
    if (status === 'passed') testCase.passCount += 1;

    await testCase.save();

    res.status(200).json({
      testCase: testCase.toSafeJSON(),
      assertionResults,
      duration: execution.duration,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTestCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      requestHeaders,
      requestBody,
      requestQueryParams,
      expectedStatus,
      expectedResponseBody,
      assertions,
    } = req.body;

    const testCase = await TestCase.findById(id);

    if (!testCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }

    if (testCase.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can update test case' });
    }

    if (name) testCase.name = name;
    if (description !== undefined) testCase.description = description;
    if (requestHeaders) testCase.requestHeaders = new Map(Object.entries(requestHeaders));
    if (requestBody !== undefined) testCase.requestBody = requestBody;
    if (requestQueryParams) testCase.requestQueryParams = new Map(Object.entries(requestQueryParams));
    if (expectedStatus) testCase.expectedStatus = expectedStatus;
    if (expectedResponseBody !== undefined) testCase.expectedResponseBody = expectedResponseBody;
    if (assertions) testCase.assertions = assertions;

    await testCase.save();
    res.status(200).json(testCase.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const deleteTestCase = async (req, res, next) => {
  try {
    const { id } = req.params;

    const testCase = await TestCase.findById(id);

    if (!testCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }

    if (testCase.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can delete test case' });
    }

    testCase.isActive = false;
    await testCase.save();

    res.status(200).json({ message: 'Test case deleted successfully' });
  } catch (error) {
    next(error);
  }
};
