/**
 * lib/api/reviews.api.js
 * Provider reviews and AI summary.
 */
import api from "./axios";

export const reviewsApi = {
  /** Get all reviews for a provider (public) */
  getForProvider: (providerId) =>
    api.get(`/reviews/provider/${providerId}`),

  /**
   * Get an AI-generated summary of a provider's reviews (public).
   * Returns { summary, reviewCount } or { summary: null, reason }
   */
  getAISummary: (providerId) =>
    api.get(`/reviews/provider/${providerId}/summary`),

  /** Submit a review for a completed booking */
  createReview: (data) => api.post("/reviews", data),
};
