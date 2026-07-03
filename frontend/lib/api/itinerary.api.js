/**
 * lib/api/itinerary.api.js
 * AI Itinerary generation and retrieval.
 */
import api from "./axios";

export const itineraryApi = {
  /**
   * Ask the AI to generate a day-by-day itinerary for a trip.
   * The AI also searches the marketplace for real providers to suggest.
   */
  generateItinerary: (data) => api.post("/itineraries/generate", data),

  /** Get the itinerary already generated for a trip */
  getItineraryForTrip: (tripId) => api.get(`/itineraries/trip/${tripId}`),
};
