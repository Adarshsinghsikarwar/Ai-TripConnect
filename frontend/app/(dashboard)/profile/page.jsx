"use client";
/**
 * app/(dashboard)/profile/page.jsx
 * User profile page — view and edit name, phone, avatar URL.
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, Camera } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "@/store/useAuthStore";
import { usersApi } from "@/lib/api/users.api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await usersApi.updateProfile(data);
      updateUser(res.data.data);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>

      <div className="bg-white border border-light-border rounded-2xl p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-light-border">
          <div className="relative">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-white border-2 border-white rounded-full flex items-center justify-center shadow-sm">
              <Camera size={12} className="text-slate-500" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-lg">{user?.name}</p>
            <p className="text-sm text-light-muted">{user?.email}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {user?.roles?.map((r) => (
                <span key={r} className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full capitalize">{r}</span>
              ))}
              {user?.isEmailVerified && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">✓ Email Verified</span>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input {...register("name")} className="w-full border border-light-border rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={user?.email} disabled className="w-full border border-light-border bg-slate-50 rounded-xl py-2.5 pl-10 pr-4 text-slate-500 text-sm cursor-not-allowed" />
            </div>
            <p className="text-xs text-light-muted mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input {...register("phone")} placeholder="+91 98765 43210" className="w-full border border-light-border rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Avatar URL</label>
            <input {...register("avatarUrl")} placeholder="https://..." className="w-full border border-light-border rounded-xl py-2.5 px-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors mt-2">
            {loading ? <LoadingSpinner size="sm" /> : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-white border border-light-border rounded-xl p-5 mt-4">
        <h3 className="font-semibold text-slate-800 mb-3">Account Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-light-muted">Auth method</span><span className="capitalize text-slate-700">{user?.authProvider || "local"}</span></div>
          <div className="flex justify-between"><span className="text-light-muted">Roles</span><span className="capitalize text-slate-700">{user?.roles?.join(", ")}</span></div>
        </div>
      </div>
    </div>
  );
}
