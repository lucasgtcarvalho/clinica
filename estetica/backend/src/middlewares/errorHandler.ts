import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log do erro
  console.error('❌ Erro:', err);

  // Erro da aplicação
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Erros do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Violação de constraint única
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Registro duplicado. Este dado já existe no sistema.'
      });
    }

    // Registro não encontrado
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Registro não encontrado'
      });
    }

    // Foreign key constraint failed
    if (err.code === 'P2003') {
      return res.status(400).json({
        error: 'Erro de referência. Verifique os dados relacionados.'
      });
    }
  }

  // Erro de validação do Prisma
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: 'Dados inválidos. Verifique os campos enviados.'
    });
  }

  // Erro genérico
  return res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : err.message
  });
};
