import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
  }
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Generate token if it doesn't exist
    if (req.session && !req.session.csrfToken) {
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }

    // Send token in response header for client to use
    if (req.session?.csrfToken) {
      res.setHeader('X-CSRF-Token', req.session.csrfToken);
    }

    return next();
  }

  // For state-changing requests, validate the token
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session?.csrfToken;

    // Skip CSRF check for public API endpoints that don't use sessions
    const publicEndpoints = ['/api/auth/register', '/api/auth/login'];
    if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
      return next();
    }

    if (!token || !sessionToken || token !== sessionToken) {
      return res.status(403).json({
        error: 'Invalid CSRF token',
        message: 'CSRF token validation failed. Please refresh and try again.'
      });
    }
  }

  next();
}

export function getCsrfToken(req: Request): string | undefined {
  return req.session?.csrfToken;
}
