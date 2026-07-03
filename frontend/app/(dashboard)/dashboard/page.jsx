"use client";
/**
 * app/(dashboard)/dashboard/page.jsx
 * Home dashboard — welcome card, quick stats, recent trips, quick actions.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  CalendarCheck,
  Plus,
  Bot,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { tripsApi } from "@/lib/api/trips.api";
import { bookingsApi } from "@/lib/api/bookings.api";
import { formatDate } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import LoadingSpinner, { Skeleton } from "@/components/shared/LoadingSpinner";

const statusColors = {
  planned:   "bg-blue-100 text-blue-700",
  ongoing:   "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tripsRes, bookingsRes] = await Promise.all([
          tripsApi.getMyTrips(),  
          bookingsApi.getMyBookingsAsTraveler(),
        ]);
        setTrips(tripsRes.data.data?.trips || tripsRes.data.data || []);
        setBookings(bookingsRes.data.data || []);
      } catch {
        // Silently fail — individual pages handle their own errors.
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = [
    {
      label: "My Trips",
      value: trips.length,
      icon: MapPin,
      href: "/trips",
      color: "text-brand-600 bg-brand-50",
    },
    {
      label: "Bookings",
      value: bookings.length,
      icon: CalendarCheck,
      href: "/bookings",
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Active Trips",
      value: trips.filter((t) => t.status === "ongoing").length,
      icon: TrendingUp,
      href: "/trips",
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  const quickActions = [
    { label: "Plan New Trip", href: "/trips/new", icon: Plus, primary: true },
    { label: "Browse Providers", href: "/providers", icon: MapPin, primary: false },
    { label: "AI Assistant", href: "/assistant", icon: Bot, primary: false, ai: true },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="gradient-brand rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
        <div className="relative z-10">
          <p className="text-brand-200 text-sm font-medium mb-1">Welcome back 👋</p>
          <h2 className="text-2xl font-bold mb-1">{user?.name || "Traveler"}</h2>
          <p className="text-brand-200 text-sm">
            {trips.length === 0
              ? "Ready to plan your first adventure?"
              : `You have ${trips.length} trip${trips.length !== 1 ? "s" : ""} planned.`}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) =>
          loading ? (
            <Skeleton key={stat.label} className="h-24 rounded-xl" />
          ) : (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white border border-light-border rounded-xl p-5 flex items-center gap-4 card-hover"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-sm text-light-muted">{stat.label}</p>
              </div>
            </Link>
          )
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                action.primary
                  ? "bg-brand-500 hover:bg-brand-600 text-white"
                  : "bg-white border border-light-border text-slate-700 hover:border-brand-300 hover:text-brand-600"
              }`}
            >
              <action.icon size={16} />
              {action.label}
              {action.ai && <span className="ai-badge">AI</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent trips */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Recent Trips
          </h3>
          <Link href="/trips" className="text-sm text-brand-600 hover:text-brand-500 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white border border-dashed border-light-border rounded-xl p-8 text-center">
            <Sparkles className="text-brand-400 mx-auto mb-3" size={28} />
            <p className="font-medium text-slate-700 mb-1">No trips yet</p>
            <p className="text-sm text-light-muted mb-4">
              Let AI help you plan your first adventure!
            </p>
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Plan a Trip
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.slice(0, 4).map((trip) => (
              <Link
                key={trip._id}
                href={`/trips/${trip._id}`}
                className="flex items-center justify-between bg-white border border-light-border rounded-xl px-5 py-4 card-hover"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">{trip.title}</p>
                    <p className="text-xs text-light-muted">
                      {trip.destination} · {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">
                    {formatCurrency(trip.budget)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[trip.status] || "bg-slate-100 text-slate-600"}`}>
                    {trip.status}
                  </span>
                  <ArrowRight size={16} className="text-light-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
