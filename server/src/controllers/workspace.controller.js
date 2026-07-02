import Workspace from '../models/workspace.model.js';

export const createWorkspace = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || name.length < 2) {
      return res.status(400).json({ message: 'Workspace name is required and must be at least 2 characters' });
    }

    const workspace = new Workspace({
      name,
      description,
      owner: req.userId,
      members: [{ user: req.userId, role: 'admin' }],
    });

    await workspace.save();
    res.status(201).json(workspace.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const getWorkspaces = async (req, res, next) => {
  try {
    // Get workspaces where user is owner or member
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId },
      ],
      isActive: true,
    })
      .populate('owner', 'fullName email')
      .populate('members.user', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json(workspaces.map(w => w.toSafeJSON()));
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findById(id)
      .populate('owner', 'fullName email')
      .populate('members.user', 'fullName email');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user has access (owner or member)
    const hasAccess = workspace.owner._id.toString() === req.userId ||
      workspace.members.some(m => m.user._id.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(workspace.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const updateWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner can update
    if (workspace.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can update workspace' });
    }

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;

    await workspace.save();
    res.status(200).json(workspace.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const deleteWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner can delete
    if (workspace.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can delete workspace' });
    }

    workspace.isActive = false;
    await workspace.save();

    res.status(200).json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addWorkspaceMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role = 'member' } = req.body;

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner can add members
    if (workspace.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can add members' });
    }

    // Check if user is already a member
    const isMember = workspace.members.some(m => m.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    workspace.members.push({ user: userId, role });
    await workspace.save();

    res.status(200).json(workspace.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const removeWorkspaceMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner can remove members
    if (workspace.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can remove members' });
    }

    workspace.members = workspace.members.filter(m => m.user.toString() !== memberId);
    await workspace.save();

    res.status(200).json(workspace.toSafeJSON());
  } catch (error) {
    next(error);
  }
};
