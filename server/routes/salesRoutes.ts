import express from 'express';
import { getSales, addSale, uploadExcelSales, addExpense } from '../controllers/salesController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authenticateToken, getSales);
router.post('/', authenticateToken, addSale);
router.post('/expense', authenticateToken, addExpense);
router.post('/upload', authenticateToken, uploadExcelSales);

export default router;
