import { PrismaClient } from '@prisma/client';

// Singleton do Prisma Client
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Soft delete middleware
prisma.$use(async (params, next) => {
  // Interceptar operações de delete e transformar em update (soft delete)
  if (params.action === 'delete') {
    params.action = 'update';
    params.args['data'] = { deletedAt: new Date() };
  }

  if (params.action === 'deleteMany') {
    params.action = 'updateMany';
    if (params.args.data !== undefined) {
      params.args.data['deletedAt'] = new Date();
    } else {
      params.args['data'] = { deletedAt: new Date() };
    }
  }

  return next(params);
});

// Filtrar registros deletados (soft delete)
prisma.$use(async (params, next) => {
  if (params.action === 'findUnique' || params.action === 'findFirst') {
    params.action = 'findFirst';
    params.args.where = {
      ...params.args.where,
      deletedAt: null,
    };
  }

  if (params.action === 'findMany') {
    if (params.args.where) {
      if (!params.args.where.deletedAt) {
        params.args.where = {
          ...params.args.where,
          deletedAt: null,
        };
      }
    } else {
      params.args.where = {
        deletedAt: null,
      };
    }
  }

  return next(params);
});

export default prisma;
