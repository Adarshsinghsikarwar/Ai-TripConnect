"use client";
/**
 * components/auth/AuthProvider.jsx
 * Rehydrates auth state from localStorage on first load.
 * Wraps the whole app — child pages can safely read from useAuthStore.
 */
import { useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { connectSocket } from "@/lib/socket";

export default function AuthProvider({ children }) {
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    // On first load, if the user was previously logged in (token in localStorage),
    // reconnect the socket so real-time features work immediately.
    if (isAuthenticated && accessToken) {
      connectSocket(accessToken);
    }
  }, [isAuthenticated, accessToken]);

  return <>{children}</>;
}
