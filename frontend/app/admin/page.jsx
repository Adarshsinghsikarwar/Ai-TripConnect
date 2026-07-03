"use client";
/**
 * app/admin/page.jsx
 * Admin dashboard — platform-wide stats and top-rated providers.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, MapPin, CalendarCheck, TrendingUp, Shield, Star } from "lucide-react";
import { analyticsApi } from "@/lib/api/analytics.api";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import LoadingSpinner, { Skeleton } from "@/components/shared/LoadingSpinner";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.getDashboard(), analyticsApi.getTopProviders()])
      .then(([dRes, tRes]) => {
        setDashboard(dRes.data.data);
        setTopProviders(tRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = dashboard ? [
    { label: "Total Users",    value: dashboard.totalUsers    || 0, icon: Users,        color: "text-brand-600 bg-brand-50" },
    { label: "Total Trips",    value: dashboard.totalTrips    || 0, icon: MapPin,        color: "text-amber-600 bg-amber-50" },
    { label: "Total Bookings", value: dashboard.totalBookings || 0, icon: CalendarCheck, color: "text-emerald-600 bg-emerald-50" },
    { label: "Total Revenue",  value: formatCurrency(dashboard.totalRevenue || 0), icon: TrendingUp, color: "text-violet-600 bg-violet-50" },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-light-muted text-sm">Platform-wide overview</p>
        </div>
        <Link href="/admin/verifications"
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Shield size={14} /> Pending Verifications
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? [1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />) :
          stats.map((s) => (
            <div key={s.label} className="bg-white border border-light-border rounded-xl p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon size={18} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-light-muted mt-0.5">{s.label}</p>
            </div>
          ))
        }
      </div>

      {/* Revenue chart (mock monthly breakdown from dashboard) */}
      {!loading && dashboard?.monthlyRevenue?.length > 0 && (
        <div className="bg-white border border-light-border rounded-xl p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dashboard.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top rated providers */}
      <div className="bg-white border border-light-border rounded-xl p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Top Rated Providers</h3>
        {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div> :
          topProviders.length === 0 ? <p className="text-sm text-light-muted">No providers yet.</p> :
          <div className="space-y-3">
            {topProviders.slice(0,8).map((p, i) => (
              <div key={p._id} className="flex items-center gap-4">
                <span className="w-6 text-center text-sm font-bold text-light-muted">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{p.title}</p>
                  <p className="text-xs text-light-muted capitalize">{p.serviceType} · {p.location?.city}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-slate-700">{Number(p.avgRating).toFixed(1)}</span>
                  <span className="text-xs text-light-muted">({p.reviewCount})</span>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
