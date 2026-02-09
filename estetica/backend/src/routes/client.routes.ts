import { Router } from 'express';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  res.json({ message: 'List clients' });
});

router.post('/', async (req, res) => {
  res.json({ message: 'Create client' });
});

router.get('/:id', async (req, res) => {
  res.json({ message: 'Get client' });
});

router.patch('/:id', async (req, res) => {
  res.json({ message: 'Update client' });
});

router.delete('/:id', async (req, res) => {
  res.json({ message: 'Delete client' });
});

router.get('/:id/history', async (req, res) => {
  res.json({ message: 'Get client history' });
});

export default router;
