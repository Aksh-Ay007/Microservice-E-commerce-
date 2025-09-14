// packages/libs/prisma/index.ts
import { PrismaClient } from '@prisma/client';

// Prevent multiple connections in development
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient({
  log: ['query'], // Log database queries for debugging
});

if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma;
}

export default prisma;
