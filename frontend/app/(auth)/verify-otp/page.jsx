"use client";
/**
 * app/(auth)/verify-otp/page.jsx
 * OTP verification page — shown after registration.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth.api";
import useAuthStore from "@/store/useAuthStore";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Suspense } from "react";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { login } = useAuthStore();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto-focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ email, otp: code });
      const { user, accessToken } = res.data.data;
      login(user, accessToken);
      toast.success("Email verified! Welcome to AI TripConnect 🎉");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendOtp({ email });
      toast.success("A new OTP has been sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
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
          <div className="mt-6 w-14 h-14 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
            <Mail className="text-brand-400" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Check your email</h2>
          <p className="mt-2 text-slate-400 text-sm">
            We sent a 6-digit OTP to{" "}
            <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP inputs */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  maxLength={1}
                  className="w-11 h-12 text-center text-xl font-bold bg-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              {loading ? <LoadingSpinner size="sm" /> : "Verify Email"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Didn&apos;t receive it?{" "}
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-brand-400 hover:text-brand-300 font-medium disabled:opacity-50 transition-colors"
              >
                {resending ? "Sending..." : "Resend OTP"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-hero" />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
