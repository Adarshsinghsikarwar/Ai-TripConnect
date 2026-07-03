"use client";
/**
 * components/layout/Sidebar.jsx
 * Dark sidebar navigation for the AI TriConnect dashboard.
 * Shows different nav items based on the user's roles.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Users,
  CalendarCheck,
  Wallet,
  Bot,
  UserCircle,
  LogOut,
  Sparkles,
  ShieldCheck,
  Briefcase,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import useAuthStore from "@/store/useAuthStore";
import { authApi } from "@/lib/api/auth.api";
import toast from "react-hot-toast";

// ── Nav items ────────────────────────────────────────────────────────────────
const navItems = [
  { label: "Dashboard",    href: "/dashboard",           icon: LayoutDashboard, roles: null },
  { label: "My Trips",     href: "/trips",               icon: MapPin,          roles: null },
  { label: "Providers",    href: "/providers",           icon: Users,           roles: null },
  { label: "Bookings",     href: "/bookings",            icon: CalendarCheck,   roles: null },
  { label: "AI Assistant", href: "/assistant",           icon: Bot,             roles: null, ai: true },
  { label: "Profile",      href: "/profile",             icon: UserCircle,      roles: null },
  // Provider-only
  { label: "My Services",  href: "/provider-dashboard",  icon: Briefcase,       roles: ["provider"] },
  // Admin-only
  { label: "Admin",        href: "/admin",               icon: ShieldCheck,     roles: ["admin"] },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasRole } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore server error — still log out locally.
    }
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((role) => hasRole(role));
  });

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-surface flex flex-col z-30",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ── Logo ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm leading-none">AI TripConnect</span>
              <span className="block text-xs text-surface-muted">Platform</span>
            </div>
          </Link>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden text-surface-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                        : "text-surface-muted hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon
                      size={17}
                      className={isActive ? "text-brand-400" : ""}
                    />
                    <span>{item.label}</span>
                    {item.ai && (
                      <span className="ai-badge ml-auto">AI</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── User info + logout ── */}
        <div className="px-3 py-4 border-t border-surface-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-surface-muted text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-muted hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
