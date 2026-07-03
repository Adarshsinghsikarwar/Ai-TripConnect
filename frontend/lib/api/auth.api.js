/**
 * lib/api/auth.api.js
 * All authentication-related API calls.
 */
import api from "./axios";

export const authApi = {
  /** Register a new user */
  register: (data) => api.post("/auth/register", data),

  /** Login with email + password */
  login: (data) => api.post("/auth/login", data),

  /** Logout (clears refresh token cookie on server) */
  logout: () => api.post("/auth/logout"),

  /** Silently refresh the access token using the httpOnly cookie */
  refresh: () => api.post("/auth/refresh"),

  /** Verify email with OTP sent after registration */
  verifyOtp: (data) => api.post("/auth/verify-otp", data),

  /** Resend OTP to the user's email */
  resendOtp: (data) => api.post("/auth/resend-otp", data),

  /** Request a password reset OTP */
  forgotPassword: (data) => api.post("/auth/forgot-password", data),

  /** Submit new password with the reset OTP */
  resetPassword: (data) => api.post("/auth/reset-password", data),

  /** Build the Google OAuth URL (redirect browser to this) */
  googleOAuthUrl: () =>
    `${process.env.NEXT_PUBLIC_API_URL || "https://travel-app-backend-8xlt.onrender.com/api/v1"}/auth/google`,
};
