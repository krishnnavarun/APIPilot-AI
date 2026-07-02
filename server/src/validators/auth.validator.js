import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const registerValidator = (data) => {
  const errors = {};

  if (!data.fullName?.trim()) {
    errors.fullName = 'Full name is required';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/[A-Z]/.test(data.password)) {
    errors.password = 'Password must contain at least one uppercase letter';
  } else if (!/[0-9]/.test(data.password)) {
    errors.password = 'Password must contain at least one number';
  } else if (!/[!@#$%^&*]/.test(data.password)) {
    errors.password = 'Password must contain at least one special character (!@#$%^&*)';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const loginValidator = (data) => {
  const errors = {};

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (_err) {
    return null;
  }
};
