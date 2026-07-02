import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'run_test', 'comment', 'execute'],
      required: true,
    },
    target: {
      type: String,
      enum: ['endpoint', 'testcase', 'comment', 'project'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    description: String,
  },
  { timestamps: true, versionKey: false }
);

activitySchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    user: this.user,
    action: this.action,
    target: this.target,
    targetId: this.targetId,
    project: this.project,
    changes: this.changes,
    description: this.description,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('Activity', activitySchema);
