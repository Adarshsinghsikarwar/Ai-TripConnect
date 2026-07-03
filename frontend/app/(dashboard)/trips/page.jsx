"use client";
/**
 * app/(dashboard)/trips/page.jsx
 * My trips list with status filter tabs and create button.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MapPin, Trash2, ArrowRight, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { tripsApi } from "@/lib/api/trips.api";
import { formatDate, getDaysBetween } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import LoadingSpinner, { Skeleton } from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";

const STATUS_TABS = ["all", "planned", "ongoing", "completed", "cancelled"];
const statusColors = {
  planned:   "bg-blue-100 text-blue-700 border-blue-200",
  ongoing:   "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tripsApi.getMyTrips();
      setTrips(res.data.data?.trips || res.data.data || []);
    } catch {
      setError("Failed to load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await tripsApi.deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
      toast.success("Trip deleted");
    } catch {
      toast.error("Failed to delete trip");
    }
  };

  const filtered = activeTab === "all" ? trips : trips.filter((t) => t.status === activeTab);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Trips</h1>
          <p className="text-light-muted text-sm mt-0.5">{trips.length} trip{trips.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link
          href="/trips/new"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Trip
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-brand-500 text-white"
                : "bg-white border border-light-border text-slate-600 hover:border-brand-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchTrips} />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-light-border rounded-xl p-12 text-center">
          <MapPin className="text-slate-300 mx-auto mb-3" size={32} />
          <p className="font-medium text-slate-700 mb-1">
            {activeTab === "all" ? "No trips yet" : `No ${activeTab} trips`}
          </p>
          {activeTab === "all" && (
            <Link
              href="/trips/new"
              className="mt-4 inline-flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              <Plus size={16} /> Plan your first trip
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((trip) => (
            <Link
              key={trip._id}
              href={`/trips/${trip._id}`}
              className="block bg-white border border-light-border rounded-xl p-5 card-hover group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={18} className="text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                        {trip.title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusColors[trip.status] || ""}`}>
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{trip.destination}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-light-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                      </span>
                      <span>{getDaysBetween(trip.startDate, trip.endDate)} days</span>
                    </div>
                    {trip.description && (
                      <p className="text-sm text-light-muted mt-2 line-clamp-1">{trip.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-base font-semibold text-slate-800 hidden sm:block">
                    {formatCurrency(trip.budget)}
                  </span>
                  <button
                    onClick={(e) => handleDelete(trip._id, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ArrowRight size={16} className="text-light-muted" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
