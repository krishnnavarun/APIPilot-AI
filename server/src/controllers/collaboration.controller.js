import Comment from '../models/comment.model.js';
import Activity from '../models/activity.model.js';
import Endpoint from '../models/endpoint.model.js';

// Comments CRUD
export const createComment = async (req, res, next) => {
  try {
    const { text, endpointId, projectId } = req.body;

    if (!text || !endpointId) {
      return res.status(400).json({ message: 'Text and Endpoint ID are required' });
    }

    const comment = new Comment({
      text,
      author: req.userId,
      endpoint: endpointId,
      project: projectId,
    });

    await comment.save();

    // Log activity
    await Activity.create({
      user: req.userId,
      action: 'comment',
      target: 'comment',
      targetId: comment._id,
      project: projectId,
      description: `Commented on endpoint`,
    });

    res.status(201).json(comment.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const getCommentsByEndpoint = async (req, res, next) => {
  try {
    const { endpointId } = req.params;

    const comments = await Comment.find({ endpoint: endpointId })
      .populate('author', 'fullName email avatarUrl')
      .populate('replies.author', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json(comments.map((c) => c.toSafeJSON()));
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only author can update comment' });
    }

    comment.text = text;
    await comment.save();

    res.status(200).json(comment.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only author can delete comment' });
    }

    await Comment.findByIdAndDelete(id);

    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

export const resolveComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolved } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.resolved = resolved;
    await comment.save();

    res.status(200).json(comment.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

// Activity Feed
export const getActivityFeed = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const activities = await Activity.find({ project: projectId })
      .populate('user', 'fullName email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Activity.countDocuments({ project: projectId });

    res.status(200).json({
      activities: activities.map((a) => a.toSafeJSON()),
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    next(error);
  }
};

export const logActivity = async (req, res, next) => {
  try {
    const { action, target, targetId, projectId, description, changes } = req.body;

    if (!action || !target || !targetId || !projectId) {
      return res
        .status(400)
        .json({ message: 'Action, target, targetId, and projectId are required' });
    }

    const activity = new Activity({
      user: req.userId,
      action,
      target,
      targetId,
      project: projectId,
      description,
      changes,
    });

    await activity.save();

    res.status(201).json(activity.toSafeJSON());
  } catch (error) {
    next(error);
  }
};
