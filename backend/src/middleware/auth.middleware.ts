import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../auth/jwt.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authorization header is required',
    });
    return;
  }

  if (!authorization.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Bearer token is required',
    });
    return;
  }

  const token = authorization.slice('Bearer '.length).trim();

  if (!token) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Access token is required',
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    res.status(401).json({
      error: 'INVALID_OR_EXPIRED_TOKEN',
      message: 'The access token is invalid or expired',
    });
  }
}