/**
 * store/useAuthStore.js
 * Global authentication state using Zustand.
 *
 * Persists user info to localStorage so the user stays logged in on refresh.
 * The access token is also stored in localStorage and sent by the Axios interceptor.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { connectSocket, disconnectSocket } from "@/lib/socket";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────────────
      user: null,         // { _id, name, email, roles, avatarUrl, isEmailVerified }
      accessToken: null,
      isAuthenticated: false,

      // ── Actions ────────────────────────────────────────────────────────────

      /**
       * Call this after a successful login or register response.
       * Saves user + token and connects the socket.
       */
      login: (user, accessToken) => {
        localStorage.setItem("accessToken", accessToken);
        connectSocket(accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },

      /**
       * Call this after a successful silent token refresh.
       * Updates the access token in state and localStorage.
       */
      refreshAccessToken: (accessToken) => {
        localStorage.setItem("accessToken", accessToken);
        set({ accessToken });
      },

      /**
       * Call this after logout or when the refresh token expires.
       */
      logout: () => {
        localStorage.removeItem("accessToken");
        disconnectSocket();
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      /**
       * Update the stored user object (e.g. after editing the profile).
       */
      updateUser: (updates) =>
        set((state) => ({
          user: { ...state.user, ...updates },
        })),

      /**
       * Check if the logged-in user has a specific role.
       * Usage: hasRole("admin")
       */
      hasRole: (role) => {
        const { user } = get();
        return user?.roles?.includes(role) ?? false;
      },
    }),
    {
      name: "auth-storage",       // localStorage key
      partialize: (state) => ({   // only persist these fields
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
