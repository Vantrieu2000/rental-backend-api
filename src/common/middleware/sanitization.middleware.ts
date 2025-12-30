import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize body (this is mutable)
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitize(req.body);
    }

    // Sanitize query parameters (need to modify in place)
    if (req.query && typeof req.query === 'object') {
      this.sanitizeInPlace(req.query);
    }

    // Sanitize params (need to modify in place)
    if (req.params && typeof req.params === 'object') {
      this.sanitizeInPlace(req.params);
    }

    next();
  }

  private sanitize(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    const sanitized: any = {};
    for (const key in obj) {
      // Remove MongoDB operators
      if (key.startsWith('$')) {
        continue;
      }
      sanitized[key] = this.sanitize(obj[key]);
    }
    return sanitized;
  }

  private sanitizeInPlace(obj: any): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    // Get all keys that start with $
    const keysToDelete: string[] = [];
    for (const key in obj) {
      if (key.startsWith('$')) {
        keysToDelete.push(key);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.sanitizeInPlace(obj[key]);
      }
    }

    // Delete dangerous keys
    keysToDelete.forEach((key) => delete obj[key]);
  }
}
