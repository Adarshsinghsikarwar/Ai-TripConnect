/**
 * lib/api/assistant.api.js
 * AI Travel Assistant (RAG chatbot).
 */
import api from "./axios";

export const assistantApi = {
  /**
   * Ask the AI assistant a question.
   * The backend uses RAG — it queries real provider/booking data before answering.
   * Returns { answer: "..." }
   */
  ask: (question) => api.post("/assistant/ask", { question }),
};
