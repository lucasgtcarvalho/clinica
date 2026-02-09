import { Router } from 'express';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  res.json({ message: 'List packages' });
});

router.post('/', async (req, res) => {
  res.json({ message: 'Create package' });
});

router.get('/:id', async (req, res) => {
  res.json({ message: 'Get package' });
});

router.patch('/:id', async (req, res) => {
  res.json({ message: 'Update package' });
});

router.delete('/:id', async (req, res) => {
  res.json({ message: 'Delete package' });
});

export default router;
