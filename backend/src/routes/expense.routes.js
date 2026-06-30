import express from 'express';
import requireAuth from '../middlewares/auth.middleware.js';
import { addExpense, getTripExpenses, getCategoryBreakdown, getMonthlyTrend } from '../controllers/expense.controller.js';

const router = express.Router();
router.use(requireAuth);

router.post('/', addExpense);
router.get('/trend/monthly', getMonthlyTrend);
router.get('/trip/:tripId', getTripExpenses);
router.get('/trip/:tripId/breakdown', getCategoryBreakdown);

export default router;