import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    replies: [
      {
        text: String,
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: Date,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

commentSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    text: this.text,
    author: this.author,
    endpoint: this.endpoint,
    resolved: this.resolved,
    replies: this.replies,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('Comment', commentSchema);
