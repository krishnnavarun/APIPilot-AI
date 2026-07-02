import mongoose from 'mongoose';

const endpointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Endpoint name is required'],
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [200, 'Name cannot exceed 200 characters'],
      trim: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      default: 'GET',
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    description: {
      type: String,
      default: null,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    headers: {
      type: Map,
      of: String,
      default: {},
    },
    queryParams: {
      type: Map,
      of: String,
      default: {},
    },
    body: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    bodyType: {
      type: String,
      enum: ['json', 'xml', 'form', 'text', null],
      default: 'json',
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    responseStatus: {
      type: Number,
      default: 200,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

endpointSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    method: this.method,
    url: this.url,
    description: this.description,
    headers: Object.fromEntries(this.headers),
    queryParams: Object.fromEntries(this.queryParams),
    body: this.body,
    bodyType: this.bodyType,
    response: this.response,
    responseStatus: this.responseStatus,
    project: this.project,
    tags: this.tags,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('Endpoint', endpointSchema);
