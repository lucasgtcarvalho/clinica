import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registrar nova clínica e usuário admin
 * @access  Public
 */
router.post(
  '/register',
  [
    body('tenantName').notEmpty().withMessage('Nome da clínica é obrigatório'),
    body('tenantSlug').notEmpty().withMessage('Slug da clínica é obrigatório'),
    body('name').notEmpty().withMessage('Nome do usuário é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    validate
  ],
  authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login de usuário
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória'),
    validate
  ],
  authController.login
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Solicitar redefinição de senha
 * @access  Public
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Email inválido'),
    validate
  ],
  authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Redefinir senha
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token é obrigatório'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    validate
  ],
  authController.resetPassword
);

export default router;
