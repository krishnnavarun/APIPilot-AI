import User from '../models/user.model.js';
import { registerValidator, loginValidator, generateToken } from '../validators/auth.validator.js';

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    const validation = registerValidator({ fullName, email, password, confirmPassword });
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists',
      });
    }

    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'owner',
      isEmailVerified: false,
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      message: 'Account created successfully',
      user: newUser.toSafeJSON(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const validation = loginValidator({ email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Logged in successfully',
      user: user.toSafeJSON(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json({
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req, res) => {
  res.status(200).json({
    message: 'Logged out successfully',
  });
};
