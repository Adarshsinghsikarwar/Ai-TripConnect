/**
 * lib/api/bookings.api.js
 * Booking lifecycle API calls — request, respond, pay, cancel, complete.
 */
import api from "./axios";

export const bookingsApi = {
  /** Traveler: create a booking request */
  createBooking: (data) => api.post("/bookings", data),

  /** Traveler: get all my bookings */
  getMyBookingsAsTraveler: () => api.get("/bookings/mine/traveler"),

  /** Provider: get all booking requests for me */
  getMyBookingsAsProvider: () => api.get("/bookings/mine/provider"),

  /** Get single booking by ID */
  getBookingById: (id) => api.get(`/bookings/${id}`),

  /** Provider: accept or reject a booking request */
  respondToBooking: (id, action) =>
    api.patch(`/bookings/${id}/respond`, { action }),  // action: "accepted" | "rejected"

  /** Traveler: verify Razorpay payment after checkout */
  verifyPayment: (id, paymentData) =>
    api.post(`/bookings/${id}/verify-payment`, paymentData),

  /** Cancel a booking (traveler or provider) */
  cancelBooking: (id, reason) =>
    api.patch(`/bookings/${id}/cancel`, { reason }),

  /** Provider: mark a booking as completed */
  markCompleted: (id) => api.patch(`/bookings/${id}/complete`),
};
