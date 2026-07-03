/**
 * lib/api/messages.api.js
 * In-app messaging between traveler and provider per booking.
 */
import api from "./axios";

export const messagesApi = {
  /** Send a message in a booking's conversation thread */
  sendMessage: (bookingId, content) =>
    api.post(`/messages/${bookingId}`, { content }),

  /** Get the full message thread for a booking */
  getThread: (bookingId) => api.get(`/messages/${bookingId}`),
};
