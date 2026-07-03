"use client";
/**
 * components/layout/Topbar.jsx
 * Top navigation bar — shows page title, mobile menu button, and user avatar.
 */
import { Menu, Bell } from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/store/useAuthStore";
import useNotificationStore from "@/store/useNotificationStore";

export default function Topbar({ onMenuClick, title }) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  return (
    <header className="h-16 bg-white border-b border-light-border flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-10">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1 className="font-semibold text-slate-800 text-base flex-1 truncate">
        {title || "AI TriConnect"}
      </h1>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
          )}
        </button>

        {/* User avatar */}
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          {user?.name?.[0]?.toUpperCase() || "U"}
        </Link>
      </div>
    </header>
  );
}
