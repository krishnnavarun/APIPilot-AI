import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 128,
      select: false,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'owner',
    },
    avatarUrl: {
      type: String,
      default: null,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre('save', async function hashPasswordIfChanged(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.verifyPassword = function verifyPassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    avatarUrl: this.avatarUrl,
    isEmailVerified: this.isEmailVerified,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = model('User', userSchema);

export default User;
