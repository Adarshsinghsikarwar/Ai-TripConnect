"use client";
/**
 * app/(auth)/register/page.jsx
 * Registration page — name, email, password, with OTP redirect on success.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Sparkles, User, Mail, Lock, Compass, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth.api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { FieldError } from "@/components/shared/ErrorMessage";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must contain a letter")
      .regex(/\d/, "Password must contain a number"),
    confirmPassword: z.string(),
    role: z.enum(["traveler", "provider"]),
    category: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (d) => d.role !== "provider" || (d.category && d.category.trim() !== ""),
    {
      message: "Please select a service category",
      path: ["category"],
    }
  );

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "traveler",
      category: "",
    },
  });

  const watchRole = watch("role");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        category: data.role === "provider" ? data.category : undefined,
      });
      toast.success("Account created! Check your email for the OTP.");
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
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
            <span className="font-bold text-white text-xl">AI TripConnect</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white">Create your account</h2>
          <p className="mt-2 text-slate-400 text-sm">Start planning smarter trips with AI</p>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-2xl p-8 shadow-xl">
          {/* Google */}
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
              <span className="bg-surface-card px-3 text-slate-500">or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Account Type selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">I want to register as a</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex flex-col items-center justify-center gap-2 py-3 px-4 rounded-xl border cursor-pointer transition-all ${
                  watchRole === "traveler"
                    ? "border-brand-500 bg-brand-500/10 text-white"
                    : "border-surface-border bg-surface text-slate-400 hover:text-slate-200"
                }`}>
                  <input
                    type="radio"
                    value="traveler"
                    {...register("role")}
                    className="sr-only"
                  />
                  <Compass size={20} className={watchRole === "traveler" ? "text-brand-400" : "text-slate-500"} />
                  <span className="text-sm font-medium">Traveler</span>
                </label>
                <label className={`flex flex-col items-center justify-center gap-2 py-3 px-4 rounded-xl border cursor-pointer transition-all ${
                  watchRole === "provider"
                    ? "border-brand-500 bg-brand-500/10 text-white"
                    : "border-surface-border bg-surface text-slate-400 hover:text-slate-200"
                }`}>
                  <input
                    type="radio"
                    value="provider"
                    {...register("role")}
                    className="sr-only"
                  />
                  <Briefcase size={20} className={watchRole === "provider" ? "text-brand-400" : "text-slate-500"} />
                  <span className="text-sm font-medium">Service Provider</span>
                </label>
              </div>
              <FieldError message={errors.role?.message} />
            </div>

            {watchRole === "provider" && (
              <div className="mt-3 animate-fadeIn">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Category</label>
                <select
                  {...register("category")}
                  className="w-full bg-surface border border-surface-border rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors capitalize"
                >
                  <option value="" className="bg-slate-900">Select a category...</option>
                  <option value="driver" className="bg-slate-900">Driver</option>
                  <option value="guide" className="bg-slate-900">Guide</option>
                  <option value="homestay" className="bg-slate-900">Homestay</option>
                  <option value="planner" className="bg-slate-900">Planner</option>
                  <option value="photographer" className="bg-slate-900">Photographer</option>
                  <option value="other" className="bg-slate-900">Other</option>
                </select>
                <FieldError message={errors.category?.message} />
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register("name")}
                  placeholder="Ravi Kumar"
                  className="w-full bg-surface border border-surface-border rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <FieldError message={errors.name?.message} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
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
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  placeholder="Min 8 characters"
                  className="w-full bg-surface border border-surface-border rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError message={errors.password?.message} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-surface border border-surface-border rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <FieldError message={errors.confirmPassword?.message} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors mt-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
