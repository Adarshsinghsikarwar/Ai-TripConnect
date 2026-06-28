import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    traveler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
      index: true,
    },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    amount: { type: Number, required: true, min: 0 }, // total amount traveler pays
    commissionAmount: { type: Number, required: true, min: 0 }, // platform's cut
    providerPayoutAmount: { type: Number, required: true, min: 0 }, // amount - commission

    status: {
      type: String,
      enum: [
        "requested",
        "confirmed",
        "ongoing",
        "completed",
        "cancelled",
        "rejected",
        "expired",
      ],
      default: "requested",
      index: true,
    },

    payment: {
      razorpayOrderId: { type: String, index: true },
      razorpayPaymentId: { type: String, default: null },
      status: {
        type: String,
        enum: ["pending", "paid", "refunded", "failed"],
        default: "pending",
      },
      paidAt: { type: Date, default: null },
    },

    respondBy: { type: Date, required: true },

    cancellation: {
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: { type: String, trim: true },
      cancelledAt: { type: Date },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ provider: 1, status: 1 });

export default mongoose.model("Booking", bookingSchema);
