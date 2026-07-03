"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import { usersApi } from "@/lib/api/users.api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import toast from "react-hot-toast";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [errorOccurred, setErrorOccurred] = useState(false);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");

    if (!accessToken) {
      toast.error("Google authentication failed: Token missing");
      setErrorOccurred(true);
      router.replace("/login");
      return;
    }

    async function fetchUserAndLogin() {
      try {
        // Set the Authorization header for this single request temporarily
        // so we can fetch the user details using the newly received token.
        // The Zustand store login() call will then save it globally.
        localStorage.setItem("accessToken", accessToken);
        
        const res = await usersApi.getMe();
        const user = res.data.data;
        
        login(user, accessToken);
        toast.success(`Logged in successfully! Welcome, ${user.name}`);
        router.replace("/dashboard");
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch profile during Google login");
        localStorage.removeItem("accessToken");
        setErrorOccurred(true);
        router.replace("/login");
      }
    }

    fetchUserAndLogin();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        {!errorOccurred ? (
          <>
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-slate-400">Completing Google sign-in, please wait...</p>
          </>
        ) : (
          <p className="text-red-500">Redirecting to login...</p>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-surface"><LoadingSpinner size="lg" /></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
