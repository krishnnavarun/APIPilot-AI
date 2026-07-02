import Endpoint from '../models/endpoint.model.js';
import Project from '../models/project.model.js';
import { executeEndpointRequest } from '../services/endpoint-executor.js';

export const createEndpoint = async (req, res, next) => {
  try {
    const { name, method, url, description, headers, queryParams, body, bodyType, projectId, tags } = req.body;

    if (!name || !url || !projectId) {
      return res.status(400).json({ message: 'Name, URL, and Project ID are required' });
    }

    // Verify project access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const endpoint = new Endpoint({
      name,
      method,
      url,
      description,
      headers: new Map(Object.entries(headers || {})),
      queryParams: new Map(Object.entries(queryParams || {})),
      body,
      bodyType,
      project: projectId,
      owner: req.userId,
      tags: tags || [],
    });

    await endpoint.save();
    res.status(201).json(endpoint.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const getEndpointsByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const endpoints = await Endpoint.find({
      project: projectId,
      isActive: true,
    })
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json(endpoints.map(e => e.toSafeJSON()));
  } catch (error) {
    next(error);
  }
};

export const getEndpointById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const endpoint = await Endpoint.findById(id)
      .populate('owner', 'fullName email')
      .populate('project');

    if (!endpoint) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    res.status(200).json(endpoint.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const updateEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, method, url, description, headers, queryParams, body, bodyType, tags } = req.body;

    const endpoint = await Endpoint.findById(id);

    if (!endpoint) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    if (endpoint.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can update endpoint' });
    }

    if (name) endpoint.name = name;
    if (method) endpoint.method = method;
    if (url) endpoint.url = url;
    if (description !== undefined) endpoint.description = description;
    if (headers) endpoint.headers = new Map(Object.entries(headers));
    if (queryParams) endpoint.queryParams = new Map(Object.entries(queryParams));
    if (body !== undefined) endpoint.body = body;
    if (bodyType) endpoint.bodyType = bodyType;
    if (tags) endpoint.tags = tags;

    await endpoint.save();
    res.status(200).json(endpoint.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const deleteEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const endpoint = await Endpoint.findById(id);

    if (!endpoint) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    if (endpoint.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can delete endpoint' });
    }

    endpoint.isActive = false;
    await endpoint.save();

    res.status(200).json({ message: 'Endpoint deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const executeEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { overrideHeaders, overrideBody, overrideQueryParams } = req.body;

    const endpoint = await Endpoint.findById(id);

    if (!endpoint) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    const executionResult = await executeEndpointRequest(endpoint, {
      overrideHeaders,
      overrideBody,
      overrideQueryParams,
    });

    // Save actual response back to the endpoint model if it hasn't been saved yet
    if (!endpoint.response) {
      endpoint.response = executionResult.actualResponse;
      endpoint.responseStatus = executionResult.actualStatus;
      await endpoint.save();
    }

    res.status(200).json({
      endpoint: endpoint.toSafeJSON(),
      execution: executionResult,
    });
  } catch (error) {
    next(error);
  }
};
