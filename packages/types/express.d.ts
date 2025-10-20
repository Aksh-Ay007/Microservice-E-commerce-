/**
 * TypeScript type definitions for Express Request extensions
 * This improves type safety across all backend services
 */

import { users, sellers } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: users;
      seller?: sellers;
      admin?: users;
      role?: 'user' | 'admin' | 'seller';
      rawBody?: Buffer;
      _retry?: boolean;
    }
  }
}

export {};
