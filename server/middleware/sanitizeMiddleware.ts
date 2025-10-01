import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    // Sanitize HTML content but preserve safe formatting
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [], // Remove all HTML tags for API inputs
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item));
  }

  if (value && typeof value === 'object') {
    const sanitized: Record<string, any> = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        sanitized[key] = sanitizeValue(value[key]);
      }
    }
    return sanitized;
  }

  return value;
}

export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeValue(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery: Record<string, any> = {};
      for (const key in req.query) {
        if (req.query.hasOwnProperty(key)) {
          sanitizedQuery[key] = sanitizeValue(req.query[key]);
        }
      }
      req.query = sanitizedQuery;
    }

    // Sanitize params
    if (req.params && typeof req.params === 'object') {
      const sanitizedParams: Record<string, any> = {};
      for (const key in req.params) {
        if (req.params.hasOwnProperty(key)) {
          sanitizedParams[key] = sanitizeValue(req.params[key]);
        }
      }
      req.params = sanitizedParams;
    }

    next();
  } catch (error) {
    console.error('Error in sanitization middleware:', error);
    res.status(500).json({
      error: 'Input sanitization failed',
      message: 'An error occurred while processing your request'
    });
  }
}

export function sanitizeHtml(html: string, allowedTags?: string[]): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}
