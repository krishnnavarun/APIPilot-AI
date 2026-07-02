import { Router } from 'express';
import { register, login, me, logout } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', authMiddleware, me);
authRouter.post('/logout', authMiddleware, logout);

export default authRouter;
