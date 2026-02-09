import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

export class AuthController {
  /**
   * Registrar nova clínica e usuário admin
   */
  async register(req: Request, res: Response) {
    try {
      const { tenantName, tenantSlug, name, email, password, phone } = req.body;

      // Verificar se slug já existe
      const existingTenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug }
      });

      if (existingTenant) {
        throw new AppError('Este slug já está em uso', 409);
      }

      // Verificar se email já existe
      const existingUser = await prisma.user.findFirst({
        where: { email }
      });

      if (existingUser) {
        throw new AppError('Este email já está cadastrado', 409);
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar tenant e usuário admin em transação
      const result = await prisma.$transaction(async (tx) => {
        // Criar tenant
        const tenant = await tx.tenant.create({
          data: {
            name: tenantName,
            slug: tenantSlug,
            isActive: true,
            plan: 'basic'
          }
        });

        // Criar usuário admin
        const user = await tx.user.create({
          data: {
            tenantId: tenant.id,
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'admin',
            isActive: true
          },
          include: {
            tenant: true
          }
        });

        return { tenant, user };
      });

      // Gerar token JWT
      const token = jwt.sign(
        {
          userId: result.user.id,
          tenantId: result.user.tenantId,
          role: result.user.role,
          email: result.user.email
        },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        message: 'Clínica registrada com sucesso',
        token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          tenant: {
            id: result.tenant.id,
            name: result.tenant.name,
            slug: result.tenant.slug
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao registrar clínica', 500);
    }
  }

  /**
   * Login de usuário
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Buscar usuário
      const user = await prisma.user.findFirst({
        where: {
          email,
          isActive: true,
          deletedAt: null
        },
        include: {
          tenant: true
        }
      });

      if (!user) {
        throw new AppError('Email ou senha inválidos', 401);
      }

      // Verificar se tenant está ativo
      if (!user.tenant.isActive || user.tenant.deletedAt) {
        throw new AppError('Clínica inativa ou bloqueada', 401);
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new AppError('Email ou senha inválidos', 401);
      }

      // Atualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Gerar token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          tenantId: user.tenantId,
          role: user.role,
          email: user.email
        },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          tenant: {
            id: user.tenant.id,
            name: user.tenant.name,
            slug: user.tenant.slug,
            logo: user.tenant.logo,
            primaryColor: user.tenant.primaryColor,
            secondaryColor: user.tenant.secondaryColor
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao realizar login', 500);
    }
  }

  /**
   * Solicitar redefinição de senha
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Buscar usuário
      const user = await prisma.user.findFirst({
        where: { email, isActive: true }
      });

      // Por segurança, sempre retornar sucesso mesmo se usuário não existir
      if (!user) {
        return res.json({
          message: 'Se o email existir, você receberá instruções para redefinir sua senha'
        });
      }

      // TODO: Gerar token de recuperação e enviar por email
      // TODO: Implementar serviço de email

      res.json({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha'
      });
    } catch (error) {
      throw new AppError('Erro ao solicitar redefinição de senha', 500);
    }
  }

  /**
   * Redefinir senha
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      // TODO: Validar token de recuperação
      // TODO: Atualizar senha do usuário

      res.json({
        message: 'Senha redefinida com sucesso'
      });
    } catch (error) {
      throw new AppError('Erro ao redefinir senha', 500);
    }
  }
}
