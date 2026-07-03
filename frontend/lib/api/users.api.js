/**
 * lib/api/users.api.js
 * User profile management.
 */
import api from "./axios";

export const usersApi = {
  /** Get the current user's profile */
  getMe: () => api.get("/users/me"),

  /** Update user profile (name, phone, avatarUrl) */
  updateProfile: (data) => api.patch("/users/me", data),
};
