import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [120, 'Name cannot exceed 120 characters'],
      trim: true,
    },
    description: {
      type: String,
      default: null,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    baseUrl: {
      type: String,
      required: [true, 'Base URL is required'],
      trim: true,
    },
    apiKey: {
      type: String,
      default: null,
    },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'development',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

projectSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    workspace: this.workspace,
    baseUrl: this.baseUrl,
    environment: this.environment,
    owner: this.owner,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('Project', projectSchema);
