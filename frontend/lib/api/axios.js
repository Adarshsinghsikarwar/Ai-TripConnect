/**
 * lib/api/axios.js
 * Central Axios instance for the AI TriConnect frontend.
 *
 * What this file does:
 *  1. Creates one Axios instance pointed at the backend (localhost:5000 by default).
 *  2. Attaches the access token from localStorage to every request automatically.
 *  3. If the server returns 401 (expired token), it silently calls /auth/refresh,
 *     gets a new access token, saves it, and retries the original request ONCE.
 *  4. If refresh also fails (e.g. user logged out on another device), it clears
 *     auth state and redirects to /login.
 */

import axios from "axios";
import useAuthStore from "@/store/useAuthStore";

// ── Base URL ────────────────────────────────────────────────────────────────
// Set NEXT_PUBLIC_API_URL in .env.local to point to your backend.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ── Create the Axios instance ────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies (refresh token is httpOnly cookie)
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor — attach access token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Read the access token from localStorage (set after login/register).
    const token =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 and auto-refresh ──────────────────────
let isRefreshing = false;
// Queue of failed requests waiting for the token to be refreshed.
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  // Success — just pass through.
  (response) => response,

  // Error — check if it's a 401 and try to refresh.
  async (error) => {
    const originalRequest = error.config;

    // If the 401 came from the refresh endpoint itself, don't retry → logout.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        // Another request is already refreshing — queue this one.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The refresh token is sent automatically as an httpOnly cookie.
        const { data } = await api.post("/auth/refresh");
        const newToken = data.data?.accessToken;

        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          useAuthStore.getState().refreshAccessToken(newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — clear everything and redirect to login.
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
