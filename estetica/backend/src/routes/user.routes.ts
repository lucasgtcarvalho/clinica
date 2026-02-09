import { Router } from 'express';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  res.json({ message: 'List users' });
});

router.post('/', async (req, res) => {
  res.json({ message: 'Create user' });
});

router.get('/:id', async (req, res) => {
  res.json({ message: 'Get user' });
});

router.patch('/:id', async (req, res) => {
  res.json({ message: 'Update user' });
});

router.delete('/:id', async (req, res) => {
  res.json({ message: 'Delete user' });
});

export default router;
