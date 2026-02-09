import { Router } from 'express';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  res.json({ message: 'List services' });
});

router.post('/', async (req, res) => {
  res.json({ message: 'Create service' });
});

router.get('/:id', async (req, res) => {
  res.json({ message: 'Get service' });
});

router.patch('/:id', async (req, res) => {
  res.json({ message: 'Update service' });
});

router.delete('/:id', async (req, res) => {
  res.json({ message: 'Delete service' });
});

export default router;
