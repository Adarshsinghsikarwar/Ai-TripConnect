import expenseRepository from "../repositories/expense.repository.js";
import tripService from "./trip.service.js";
import mongoose from "mongoose";

class ExpenseService {
  async addExpense(userId, payload) {
    await tripService.getTripById(payload.trip, userId);
    return expenseRepository.create({ ...payload, user: userId });
  }
  getTripExpenses(tripId) {
    return expenseRepository.findByTrip(tripId);
  }
  getCategoryBreakdown(tripId) {
    return expenseRepository.aggregate([
      { $match: { trip: new mongoose.Schema.Types.ObjectId(tripId) } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amout" },
          count: { $sum: 1 },
        },
      },
      { $sort: -1 },
    ]);
  }

  getMonthlyTrend(userId) {
    return expenseRepository.aggregate([
      { $match: { user: new mongoose.Schema.Types.ObjectId() } },
      {
        $group: {
          _id: { year: { $year: "$spentAt" }, month: { $month: "$spentAt" } },
          total: { $sum: "$amout" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
  }
}

export default new ExpenseService();
