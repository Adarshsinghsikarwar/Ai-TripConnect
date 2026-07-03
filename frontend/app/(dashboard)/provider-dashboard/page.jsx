"use client";
/**
 * app/(dashboard)/provider-dashboard/page.jsx
 * Provider dashboard — view and respond to booking requests, mark trips complete.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Flag, Briefcase, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings.api";
import { formatDate } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import LoadingSpinner, { Skeleton } from "@/components/shared/LoadingSpinner";

const statusColors = {
  requested: "bg-blue-100 text-blue-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  ongoing:   "bg-amber-100 text-amber-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-700",
  rejected:  "bg-red-100 text-red-700",
  expired:   "bg-slate-100 text-slate-500",
};

export default function ProviderDashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    bookingsApi.getMyBookingsAsProvider()
      .then((r) => setBookings(r.data.data || []))
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const respond = async (id, action) => {
    setActionLoading((p) => ({ ...p, [id]: action }));
    try {
      await bookingsApi.respondToBooking(id, action);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: action === "accepted" ? "confirmed" : "rejected" } : b));
      toast.success(`Booking ${action === "accepted" ? "confirmed" : "rejected"}`);
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  const complete = async (id) => {
    setActionLoading((p) => ({ ...p, [id]: "complete" }));
    try {
      await bookingsApi.markCompleted(id);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: "completed" } : b));
      toast.success("Booking marked as completed!");
    } catch {
      toast.error("Failed to mark as complete");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  const pending   = bookings.filter((b) => b.status === "requested");
  const confirmed = bookings.filter((b) => ["confirmed","ongoing"].includes(b.status));
  const past      = bookings.filter((b) => ["completed","cancelled","rejected","expired"].includes(b.status));

  const Section = ({ title, items, icon: Icon }) => (
    <div className="mb-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
        <Icon size={14} /> {title} ({items.length})
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-light-muted py-4 text-center">None</p>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b._id} className="bg-white border border-light-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-800">{b.traveler?.name || "Traveler"}</p>
                  <p className="text-xs text-light-muted">{b.traveler?.email}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {formatDate(b.startDate)} – {formatDate(b.endDate)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[b.status] || ""}`}>
                    {b.status}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{formatCurrency(b.amount)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                {b.status === "requested" && (
                  <>
                    <button
                      onClick={() => respond(b._id, "accepted")}
                      disabled={actionLoading[b._id]}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      {actionLoading[b._id] === "accepted" ? <LoadingSpinner size="sm" /> : <CheckCircle size={13} />}
                      Accept
                    </button>
                    <button
                      onClick={() => respond(b._id, "rejected")}
                      disabled={actionLoading[b._id]}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      {actionLoading[b._id] === "rejected" ? <LoadingSpinner size="sm" /> : <XCircle size={13} />}
                      Reject
                    </button>
                  </>
                )}
                {b.status === "confirmed" && (
                  <button
                    onClick={() => complete(b._id)}
                    disabled={actionLoading[b._id]}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    {actionLoading[b._id] === "complete" ? <LoadingSpinner size="sm" /> : <Flag size={13} />}
                    Mark as Completed
                  </button>
                )}
                <Link href={`/bookings/${b._id}`} className="px-3 py-2 border border-light-border rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                  Chat
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Provider Dashboard</h1>
          <p className="text-light-muted text-sm mt-0.5">Manage your booking requests</p>
        </div>
        <Link href="/provider-dashboard/register"
          className="inline-flex items-center gap-1.5 text-sm bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 rounded-xl transition-colors">
          <Plus size={14} /> Setup Profile
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : (
        <>
          <Section title="Pending Requests" items={pending} icon={CheckCircle} />
          <Section title="Upcoming & Ongoing" items={confirmed} icon={Flag} />
          <Section title="Past Bookings" items={past} icon={Briefcase} />
        </>
      )}
    </div>
  );
}
