import expenseService from "../services/expense.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

const addExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.addExpense(req.userId, req.body);
  res.status(201).json(new ApiResponse(201, expense, "Expense added"));
});

const getTripExpenses = asyncHandler(async (req, res) => {
  const expenses = await expenseService.getTripExpenses(req.params.tripId);
  res.status(200).json(new ApiResponse(200, expenses));
});

const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const data = await expenseService.getCategoryBreakdown(req.params.tripId);
  res.status(200).json(new ApiResponse(200, data));
});

const getMonthlyTrend = asyncHandler(async (req, res) => {
  const data = await expenseService.getMonthlyTrend(req.userId);
  res.status(200).json(new ApiResponse(200, data));
});

export { addExpense, getTripExpenses, getCategoryBreakdown, getMonthlyTrend };
export default {
  addExpense,
  getTripExpenses,
  getCategoryBreakdown,
  getMonthlyTrend,
};
