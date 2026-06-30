import mongoose from 'mongoose';


const expenseSchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      enum: ['food', 'stay', 'travel', 'activity', 'shopping', 'other'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true },
    spentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Expense', expenseSchema);