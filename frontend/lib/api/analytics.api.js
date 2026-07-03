/**
 * lib/api/analytics.api.js
 * Admin-only analytics and verification management.
 */
import api from "./axios";

export const analyticsApi = {
  /** Admin dashboard: total users, trips, bookings, revenue */
  getDashboard: () => api.get("/analytics/dashboard"),

  /** Top-rated providers list */
  getTopProviders: () => api.get("/analytics/top-providers"),

  /** Providers pending manual verification */
  getPendingVerifications: () => api.get("/analytics/pending-verifications"),
};
