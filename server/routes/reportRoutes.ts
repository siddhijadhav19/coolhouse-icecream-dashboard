import express from 'express';
import { getDashboardStats, getReportData } from '../controllers/reportController.ts';
import { authenticateToken, authorizeRole } from '../middleware/auth.ts';

const router = express.Router();

router.get('/stats', authenticateToken, authorizeRole('admin'), getDashboardStats);
router.get('/data', authenticateToken, authorizeRole('admin'), getReportData);

export default router;
