"use client";
/**
 * components/auth/ProtectedRoute.jsx
 * Redirect unauthenticated users to /login.
 * Wrap any page that requires login with this component.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function ProtectedRoute({ children, requiredRole }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (requiredRole && !user?.roles?.includes(requiredRole)) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user, requiredRole, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
