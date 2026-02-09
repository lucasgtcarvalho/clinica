import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

// Estender Request para incluir user e tenant
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId: string;
        role: string;
        email: string;
      };
      tenant?: {
        id: string;
        slug: string;
        name: string;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

/**
 * Middleware de autenticação JWT
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obter token do header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token não fornecido'
      });
    }

    // Formato esperado: "Bearer TOKEN"
    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    // Verificar token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não configurado');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Verificar se usuário ainda existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tenant: true
      }
    });

    if (!user || !user.isActive || user.deletedAt) {
      return res.status(401).json({
        error: 'Usuário inválido ou inativo'
      });
    }

    // Verificar se tenant está ativo
    if (!user.tenant.isActive || user.tenant.deletedAt) {
      return res.status(401).json({
        error: 'Clínica inativa ou bloqueada'
      });
    }

    // Adicionar dados ao request
    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email
    };

    req.tenant = {
      id: user.tenant.id,
      slug: user.tenant.slug,
      name: user.tenant.name
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    return res.status(500).json({
      error: 'Erro ao autenticar usuário'
    });
  }
};

/**
 * Middleware de autorização por role
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Você não tem permissão para acessar este recurso'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar se usuário tem permissão específica
 */
export const checkPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado'
      });
    }

    // Admin tem todas as permissões
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { permissions: true }
      });

      if (!user) {
        return res.status(401).json({
          error: 'Usuário não encontrado'
        });
      }

      const permissions = user.permissions as any;

      if (!permissions || !permissions[permission]) {
        return res.status(403).json({
          error: `Você não tem permissão para: ${permission}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao verificar permissões'
      });
    }
  };
};
