"use client";
/**
 * app/(dashboard)/bookings/page.jsx
 * My bookings list — traveler view with status badges.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, ArrowRight, MapPin } from "lucide-react";
import { bookingsApi } from "@/lib/api/bookings.api";
import { formatDate } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import LoadingSpinner, { Skeleton } from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";

const statusStyles = {
  requested:  { color: "bg-blue-100 text-blue-700",     label: "Requested" },
  confirmed:  { color: "bg-emerald-100 text-emerald-700", label: "Confirmed" },
  ongoing:    { color: "bg-amber-100 text-amber-700",   label: "Ongoing" },
  completed:  { color: "bg-slate-100 text-slate-600",   label: "Completed" },
  cancelled:  { color: "bg-red-100 text-red-700",       label: "Cancelled" },
  rejected:   { color: "bg-red-100 text-red-700",       label: "Rejected" },
  expired:    { color: "bg-slate-100 text-slate-500",   label: "Expired" },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    bookingsApi.getMyBookingsAsTraveler()
      .then((r) => setBookings(r.data.data || []))
      .catch(() => setError("Failed to load bookings."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
    </div>
  );
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
          <p className="text-light-muted text-sm mt-0.5">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/providers" className="text-sm text-brand-600 hover:text-brand-500 font-medium flex items-center gap-1">
          Browse Providers <ArrowRight size={14} />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-dashed border-light-border rounded-xl p-12 text-center">
          <CalendarCheck className="text-slate-300 mx-auto mb-3" size={32} />
          <p className="font-medium text-slate-700 mb-1">No bookings yet</p>
          <p className="text-sm text-light-muted mb-4">Find a local guide or driver to get started.</p>
          <Link href="/providers" className="inline-flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-600">
            Browse Providers
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const s = statusStyles[b.status] || statusStyles.requested;
            return (
              <Link key={b._id} href={`/bookings/${b._id}`}
                className="block bg-white border border-light-border rounded-xl px-5 py-4 card-hover group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin size={17} className="text-brand-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors truncate">
                        {b.provider?.title || "Provider"}
                      </p>
                      <p className="text-xs text-light-muted capitalize">{b.provider?.serviceType}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(b.startDate)} – {formatDate(b.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
                    <span className="text-sm font-bold text-slate-800">{formatCurrency(b.amount)}</span>
                    <ArrowRight size={14} className="text-light-muted" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
