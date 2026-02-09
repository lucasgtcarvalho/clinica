import { Router } from 'express';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route   GET /api/v1/tenants/current
 * @desc    Obter dados do tenant atual
 * @access  Private
 */
router.get('/current', async (req, res) => {
  // TODO: Implementar controller
  res.json({ message: 'Get current tenant' });
});

/**
 * @route   PATCH /api/v1/tenants/current
 * @desc    Atualizar dados do tenant
 * @access  Private (Admin only)
 */
router.patch('/current', async (req, res) => {
  // TODO: Implementar controller
  res.json({ message: 'Update tenant' });
});

export default router;
