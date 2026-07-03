/**
 * lib/api/trips.api.js
 * Trip CRUD + AI draft endpoint calls.
 */
import api from "./axios";

export const tripsApi = {
  /** Get all trips for the logged-in user */
  getMyTrips: (params) => api.get("/trips", { params }),

  /** Get a single trip by ID */
  getTripById: (id) => api.get(`/trips/${id}`),

  /** Create a new trip */
  createTrip: (data) => api.post("/trips", data),

  /** Update a trip */
  updateTrip: (id, data) => api.patch(`/trips/${id}`, data),

  /** Delete a trip */
  deleteTrip: (id) => api.delete(`/trips/${id}`),

  /**
   * Ask the AI to generate a trip draft from rough notes.
   * Returns { title, description, destination, suggestedBudget }
   */
  generateAIDraft: (notes) => api.post("/trips/ai-draft", { notes }),
};
