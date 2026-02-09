import { Router } from 'express';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  res.json({ message: 'List appointments' });
});

router.post('/', async (req, res) => {
  res.json({ message: 'Create appointment' });
});

router.get('/:id', async (req, res) => {
  res.json({ message: 'Get appointment' });
});

router.patch('/:id', async (req, res) => {
  res.json({ message: 'Update appointment' });
});

router.delete('/:id', async (req, res) => {
  res.json({ message: 'Delete appointment' });
});

router.patch('/:id/status', async (req, res) => {
  res.json({ message: 'Update appointment status' });
});

export default router;
