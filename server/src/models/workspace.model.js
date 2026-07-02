import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [120, 'Name cannot exceed 120 characters'],
      trim: true,
    },
    description: {
      type: String,
      default: null,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['admin', 'member', 'viewer'],
          default: 'member',
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

workspaceSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    owner: this.owner,
    members: this.members,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('Workspace', workspaceSchema);
