"use client";
/**
 * app/(auth)/login/page.jsx
 * Login page — email/password + Google OAuth button.
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Sparkles, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth.api";
import useAuthStore from "@/store/useAuthStore";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { FieldError } from "@/components/shared/ErrorMessage";

// ── Validation schema ────────────────────────────────────────────────────────
const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [mounted, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { user, accessToken } = res.data.data;

      // If email is not verified, redirect to OTP page.
      if (!user.isEmailVerified) {
        toast("Please verify your email to continue.", { icon: "📧" });
        router.push(`/verify-otp?email=${encodeURIComponent(user.email)}`);
        return;
      }

      login(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);
      router.push("/dashboard");
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
      if (status === 403 && msg.toLowerCase().includes("verify")) {
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 justify-center">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-bold text-white text-xl">AI TriConnect</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-slate-400 text-sm">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-8 shadow-xl">
          {/* Google OAuth */}
          <a
            href={authApi.googleOAuthUrl()}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-surface-border text-white text-sm font-medium hover:bg-white/5 transition-colors mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2 14.1-5.3l-6.5-5.5C29.8 34.9 27 36 24 36c-5.2 0-9.6-3.1-11.3-7.6L6 33.8C9.3 39.8 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.9 2.4-2.5 4.4-4.5 5.8l6.5 5.5C36.9 41.3 44 36 44 24c0-1.3-.1-2.7-.4-3.9z"/>
            </svg>
            Continue with Google
          </a>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-card px-3 text-slate-500">or sign in with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-surface border border-surface-border rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <FieldError message={errors.email?.message} />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-surface-border rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError message={errors.password?.message} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-semibold text-sm transition-colors mt-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
