import expenseModel from "../models/expense.model.js";

class ExpenseRepository {
  create(data) {
    return expenseModel.create(data);
  }

  findByTrip(tripId) {
    return expenseModel.findById({ trip: tripId }).sort({ spentAt: -1 });
  }
  findOneAndUpdate(id, userId) {
    return expenseModel.findOneAndUpdate({ _id: id, user: userId });
  }

  aggregate(pipeline) {
    return expenseModel.aggregate(pipeline);
  }
}
export default new ExpenseRepository();
