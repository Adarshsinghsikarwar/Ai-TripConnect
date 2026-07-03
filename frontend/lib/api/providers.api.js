/**
 * lib/api/providers.api.js
 * Provider search, profile, and management API calls.
 */
import api from "./axios";

export const providersApi = {
  /** Search providers with structured filters */
  search: (params) => api.get("/providers/search", { params }),

  /**
   * Natural language smart search.
   * e.g. "cheap guide in goa under 1500" → backend parses with AI and runs search.
   */
  smartSearch: (params) => api.get("/providers/search/smart", { params }),

  /** Get a single provider's full profile */
  getProvider: (id) => api.get(`/providers/${id}`),

  /** Register as a provider (creates provider profile) */
  registerProvider: (data) => api.post("/providers", data),

  /** Update your own provider profile */
  updateProvider: (id, data) => api.patch(`/providers/${id}`, data),

  /** Upload photos to your provider profile */
  uploadPhotos: (id, formData) =>
    api.post(`/providers/${id}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /** Admin: approve / reject a provider */
  setVerification: (id, status) =>
    api.patch(`/providers/${id}/verify`, { status }),
};
