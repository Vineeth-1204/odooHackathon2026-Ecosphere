import { PrismaClient } from '@prisma/client';

// Singleton Prisma client for the whole backend
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
