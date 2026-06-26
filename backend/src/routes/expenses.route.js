import express from "express";
import {
  addExpense,
  getTripExpenses,
  getCategoryBreakdown,
  getMonthlyTrend,
} from "../controllers/expense.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(requireAuth); // Apply authentication middleware to all routes

router.post("/", addExpense);
router.get("/trend/monthly", getMonthlyTrend);
router.get("/trip/:tripId", getTripExpenses);
router.get("/trip/:tripId/breakdown", getCategoryBreakdown);

export default router;