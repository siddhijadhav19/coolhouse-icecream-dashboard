import express from 'express';
import { getInventory, addFlavor, updateStock, deleteFlavor } from '../controllers/inventoryController.ts';
import { authenticateToken, authorizeRole } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authenticateToken, getInventory);
router.post('/', authenticateToken, authorizeRole('admin'), addFlavor);
router.put('/:id', authenticateToken, authorizeRole('admin'), updateStock);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteFlavor);

export default router;
