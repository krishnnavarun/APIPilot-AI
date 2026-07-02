import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Test case name is required'],
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [200, 'Name cannot exceed 200 characters'],
      trim: true,
    },
    description: {
      type: String,
      default: null,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    endpoint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Endpoint',
      required: true,
      index: true,
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
    // Request override
    requestHeaders: {
      type: Map,
      of: String,
      default: {},
    },
    requestBody: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    requestQueryParams: {
      type: Map,
      of: String,
      default: {},
    },
    // Expected response
    expectedStatus: {
      type: Number,
      default: 200,
    },
    expectedResponseBody: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    assertions: [
      {
        type: {
          type: String,
          enum: ['statusCode', 'bodyContains', 'headerExists', 'responseTime'],
        },
        value: String,
        operator: {
          type: String,
          enum: ['equals', 'contains', 'greaterThan', 'lessThan', 'exists'],
        },
        expectedValue: String,
      },
    ],
    // Execution results
    lastRun: {
      status: { type: String, enum: ['passed', 'failed', 'pending'], default: 'pending' },
      duration: Number,
      actualStatus: Number,
      actualResponse: mongoose.Schema.Types.Mixed,
      error: String,
      timestamp: Date,
    },
    runCount: {
      type: Number,
      default: 0,
    },
    passCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

testCaseSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    endpoint: this.endpoint,
    project: this.project,
    requestHeaders: Object.fromEntries(this.requestHeaders),
    requestBody: this.requestBody,
    requestQueryParams: Object.fromEntries(this.requestQueryParams),
    expectedStatus: this.expectedStatus,
    expectedResponseBody: this.expectedResponseBody,
    assertions: this.assertions,
    lastRun: this.lastRun,
    passCount: this.passCount,
    runCount: this.runCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('TestCase', testCaseSchema);
