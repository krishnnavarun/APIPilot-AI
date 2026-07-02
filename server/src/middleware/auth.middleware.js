import { verifyToken } from '../validators/auth.validator.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'No token provided or invalid format',
    });
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }

  req.userId = decoded.id;
  next();
};
