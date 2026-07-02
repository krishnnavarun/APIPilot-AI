import Project from '../models/project.model.js';

const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD']);

const mapToObject = (value) => {
  if (!value) return {};
  if (value instanceof Map) return Object.fromEntries(value);
  return { ...value };
};

export const buildEndpointUrl = async (endpoint) => {
  let fullUrl = endpoint.url;

  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    const project = await Project.findById(endpoint.project);
    const base = project?.baseUrl || '';
    const baseSlash = base.endsWith('/') ? base : `${base}/`;
    const pathClean = fullUrl.startsWith('/') ? fullUrl.slice(1) : fullUrl;
    fullUrl = `${baseSlash}${pathClean}`;
  }

  return fullUrl;
};

export const executeEndpointRequest = async (endpoint, overrides = {}) => {
  const {
    overrideHeaders = {},
    overrideBody,
    overrideQueryParams = {},
  } = overrides;

  let fullUrl = await buildEndpointUrl(endpoint);

  const queryParamsObj = {
    ...mapToObject(endpoint.queryParams),
    ...overrideQueryParams,
  };
  const searchParams = new URLSearchParams();
  for (const [key, val] of Object.entries(queryParamsObj)) {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, String(val));
    }
  }

  const queryString = searchParams.toString();
  if (queryString) {
    fullUrl += `${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
  }

  const headersObj = {
    ...mapToObject(endpoint.headers),
    ...overrideHeaders,
  };

  const bodyData = overrideBody !== undefined ? overrideBody : endpoint.body;
  let requestBody;
  if (!METHODS_WITHOUT_BODY.has(endpoint.method) && bodyData !== undefined && bodyData !== null) {
    if (typeof bodyData === 'object') {
      requestBody = JSON.stringify(bodyData);
      if (!headersObj['Content-Type'] && !headersObj['content-type']) {
        headersObj['Content-Type'] = 'application/json';
      }
    } else {
      requestBody = String(bodyData);
    }
  }

  const startTime = Date.now();

  try {
    const response = await fetch(fullUrl, {
      method: endpoint.method,
      headers: headersObj,
      body: requestBody,
    });

    const responseHeaders = {};
    response.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    const contentType = response.headers.get('content-type') || '';
    const actualResponse = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    return {
      status: 'completed',
      duration: Date.now() - startTime,
      actualStatus: response.status,
      actualResponse,
      headers: responseHeaders,
      error: null,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      status: 'failed',
      duration: Date.now() - startTime,
      actualStatus: 0,
      actualResponse: null,
      headers: {},
      error: error.message,
      timestamp: new Date(),
    };
  }
};

export const evaluateAssertions = (testCase, execution) => {
  let allAssertionsPassed = true;
  const responseText =
    typeof execution.actualResponse === 'string'
      ? execution.actualResponse
      : JSON.stringify(execution.actualResponse);

  const assertionResults = testCase.assertions.map((assertion) => {
    let passed = true;

    if (assertion.type === 'statusCode') {
      passed = execution.actualStatus === Number.parseInt(assertion.expectedValue, 10);
    } else if (assertion.type === 'bodyContains') {
      passed = responseText.includes(assertion.expectedValue);
    } else if (assertion.type === 'headerExists') {
      passed = Boolean(execution.headers?.[assertion.value || assertion.expectedValue]);
    } else if (assertion.type === 'responseTime') {
      const threshold = Number.parseInt(assertion.expectedValue, 10);
      if (assertion.operator === 'greaterThan') passed = execution.duration > threshold;
      else passed = execution.duration < threshold;
    }

    if (!passed) allAssertionsPassed = false;
    return { ...assertion.toObject(), passed };
  });

  if (testCase.expectedStatus && execution.actualStatus !== testCase.expectedStatus) {
    allAssertionsPassed = false;
  }

  return { allAssertionsPassed, assertionResults };
};
