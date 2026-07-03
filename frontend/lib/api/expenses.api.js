/**
 * lib/api/expenses.api.js
 * Expense tracking API calls.
 */
import api from "./axios";

export const expensesApi = {
  /** Add an expense to a trip */
  addExpense: (data) => api.post("/expenses", data),

  /** Get all expenses for a trip */
  getTripExpenses: (tripId) => api.get(`/expenses/trip/${tripId}`),

  /** Get category-wise breakdown for pie/bar chart */
  getCategoryBreakdown: (tripId) =>
    api.get(`/expenses/trip/${tripId}/breakdown`),

  /** Get monthly expense trend for the user */
  getMonthlyTrend: () => api.get("/expenses/trend/monthly"),
};
