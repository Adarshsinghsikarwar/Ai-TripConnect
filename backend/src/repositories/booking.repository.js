import Booking from "../models/booking.model.js";

class BookingRepository {
  create(data) {
    return Booking.create(data);
  }

  findById(id) {
    return Booking.findById(id)
      .populate("provider")
      .populate("traveler", "name email");
  }

  findByOrderId(orderId) {
    return Booking.findOne({ "payment.razorpayOrderId": orderId });
  }

  findByTraveler(travelerId) {
    return Booking.find({ traveler: travelerId })
      .sort({ createdAt: -1 })
      .populate("provider");
  }

  findByProvider(providerId) {
    return Booking.find({ provider: providerId })
      .sort({ createdAt: -1 })
      .populate("traveler", "name email");
  }

  updateStatus(id, status, extra = {}) {
    return Booking.findByIdAndUpdate(id, { status, ...extra }, { new: true });
  }

  // Atomic conditional update — prevents two concurrent requests from both
  // accepting/cancelling the same booking (classic race condition in marketplaces).
  updateStatusIfCurrent(id, expectedStatus, newStatus, extra = {}) {
    return Booking.findOneAndUpdate(
      { _id: id, status: expectedStatus },
      { status: newStatus, ...extra },
      { new: true }
    );
  }

  findExpiredRequests() {
    return Booking.find({
      status: "requested",
      respondBy: { $lt: new Date() },
    });
  }

  aggregate(pipeline) {
    return Booking.aggregate(pipeline);
  }
}

export default new BookingRepository();
