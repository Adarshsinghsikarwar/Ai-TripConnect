"use client";
/**
 * app/(auth)/forgot-password/page.jsx
 * Forgot password flow: step 1 (email) → step 2 (OTP + new password).
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth.api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { FieldError } from "@/components/shared/ErrorMessage";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: enter email, 2: enter OTP + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) { setError("Email is required"); return; }
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword({ email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) { setError("All fields are required"); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!/[A-Za-z]/.test(newPassword)) { setError("Password must contain a letter"); return; }
    if (!/\d/.test(newPassword)) { setError("Password must contain a number"); return; }
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      toast.success("Password reset successfully! Please login.");
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 justify-center">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-bold text-white text-xl">AI TripConnect</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white">
            {step === 1 ? "Forgot your password?" : "Reset your password"}
          </h2>
          <p className="mt-2 text-slate-400 text-sm">
            {step === 1
              ? "Enter your email and we'll send you a reset OTP"
              : `Enter the OTP sent to ${email}`}
          </p>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-2xl p-8 shadow-xl">
          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-surface border border-surface-border rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <FieldError message={error} />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                {loading ? <LoadingSpinner size="sm" /> : "Send Reset OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">OTP Code</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className="w-full bg-surface border border-surface-border rounded-xl py-2.5 px-4 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-surface border border-surface-border rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <FieldError message={error} />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                {loading ? <LoadingSpinner size="sm" /> : "Reset Password"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Remembered it?{" "}
          <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
