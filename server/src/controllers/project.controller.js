import Project from '../models/project.model.js';
import Workspace from '../models/workspace.model.js';

export const createProject = async (req, res, next) => {
  try {
    const { name, description, workspaceId, baseUrl, apiKey, environment } = req.body;

    if (!name || name.length < 2) {
      return res.status(400).json({ message: 'Project name is required and must be at least 2 characters' });
    }

    if (!baseUrl) {
      return res.status(400).json({ message: 'Base URL is required' });
    }

    // Verify workspace exists and user has access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const hasAccess = workspace.owner.toString() === req.userId ||
      workspace.members.some(m => m.user.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to workspace' });
    }

    const project = new Project({
      name,
      description,
      workspace: workspaceId,
      baseUrl,
      apiKey,
      environment,
      owner: req.userId,
    });

    await project.save();
    res.status(201).json(project.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const getProjectsByWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    // Verify workspace exists and user has access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const hasAccess = workspace.owner.toString() === req.userId ||
      workspace.members.some(m => m.user.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const projects = await Project.find({
      workspace: workspaceId,
      isActive: true,
    })
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json(projects.map(p => p.toSafeJSON()));
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('owner', 'fullName email')
      .populate('workspace');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify user has access to workspace
    const workspace = await Workspace.findById(project.workspace._id);
    const hasAccess = workspace.owner.toString() === req.userId ||
      workspace.members.some(m => m.user.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(project.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, baseUrl, apiKey, environment } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can update
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can update project' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (baseUrl) project.baseUrl = baseUrl;
    if (apiKey !== undefined) project.apiKey = apiKey;
    if (environment) project.environment = environment;

    await project.save();
    res.status(200).json(project.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can delete
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    project.isActive = false;
    await project.save();

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};
