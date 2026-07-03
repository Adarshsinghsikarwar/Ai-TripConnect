"use client";
/**
 * app/(dashboard)/providers/[id]/page.jsx
 * Provider profile — photos, info, AI review summary, reviews, and booking form.
 */
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Star, Sparkles, Calendar, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { providersApi } from "@/lib/api/providers.api";
import { reviewsApi } from "@/lib/api/reviews.api";
import { bookingsApi } from "@/lib/api/bookings.api";
import { tripsApi } from "@/lib/api/trips.api";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import LoadingSpinner, { Skeleton } from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";
import StarRating, { RatingBadge } from "@/components/shared/StarRating";

export default function ProviderProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState({ tripId: "", startDate: "", endDate: "" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [pRes, rRes, myTripsRes] = await Promise.all([
          providersApi.getProvider(id),
          reviewsApi.getForProvider(id),
          tripsApi.getMyTrips(),
        ]);
        setProvider(pRes.data.data);
        setReviews(rRes.data.data || []);
        setTrips(myTripsRes.data.data?.trips || myTripsRes.data.data || []);

        // Load AI summary separately (may fail if not enough reviews)
        reviewsApi.getAISummary(id)
          .then((r) => setAiSummary(r.data.data))
          .catch(() => {});
      } catch {
        setError("Failed to load provider profile.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!booking.startDate || !booking.endDate) {
      toast.error("Please select dates");
      return;
    }
    setBookingLoading(true);
    try {
      const res = await bookingsApi.createBooking({
        provider: id,
        trip: booking.tripId || undefined,
        startDate: booking.startDate,
        endDate: booking.endDate,
      });
      toast.success("Booking request sent! Awaiting provider confirmation.");
      router.push(`/bookings/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!provider) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-light-muted hover:text-slate-700 mb-4">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Photo gallery */}
          <div className="bg-white border border-light-border rounded-xl overflow-hidden">
            <div className="h-56 bg-gradient-to-br from-brand-100 to-violet-100 relative">
              {provider.photos?.[activePhoto] ? (
                <img src={provider.photos[activePhoto]} alt={provider.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin size={40} className="text-brand-300" />
                </div>
              )}
              {provider.verificationStatus === "verified" && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                  <CheckCircle size={11} /> Verified
                </div>
              )}
            </div>
            {provider.photos?.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {provider.photos.map((ph, i) => (
                  <button key={i} onClick={() => setActivePhoto(i)}
                    className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${i === activePhoto ? "border-brand-500" : "border-transparent"}`}>
                    <img src={ph} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-white border border-light-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold text-slate-800">{provider.title}</h1>
                <p className="text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin size={14} /> {provider.location?.city || provider.location?.address || "India"}
                </p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full capitalize">{provider.serviceType}</span>
            </div>
            <RatingBadge rating={provider.avgRating} count={provider.reviewCount} className="mb-3" />
            {provider.description && <p className="text-sm text-slate-600 leading-relaxed">{provider.description}</p>}
          </div>

          {/* AI Review Summary */}
          {aiSummary?.summary && (
            <div className="bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-brand-500" />
                <span className="text-sm font-semibold text-brand-800">AI Review Summary</span>
                <span className="ai-badge">AI</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{aiSummary.summary}</p>
              <p className="text-xs text-slate-500 mt-2">Based on {aiSummary.reviewCount} reviews</p>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white border border-light-border rounded-xl p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Traveler Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-light-muted">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.slice(0, 8).map((r) => (
                  <div key={r._id} className="border-b border-light-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                        {r.traveler?.name?.[0] || "T"}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{r.traveler?.name || "Traveler"}</span>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    {r.comment && <p className="text-sm text-slate-600 ml-9">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column — Booking card ── */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-light-border rounded-xl p-5 sticky top-6">
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-brand-600">{formatCurrency(provider.pricePerDay)}</p>
              <p className="text-xs text-light-muted">per day</p>
            </div>

            <form onSubmit={handleBook} className="space-y-3">
              {trips.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Link to Trip (optional)</label>
                  <select value={booking.tripId} onChange={(e) => setBooking((b) => ({ ...b, tripId: e.target.value }))}
                    className="w-full border border-light-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-400">
                    <option value="">No trip</option>
                    {trips.map((t) => <option key={t._id} value={t._id}>{t.title}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Start Date *</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" value={booking.startDate}
                    onChange={(e) => setBooking((b) => ({ ...b, startDate: e.target.value }))}
                    className="w-full border border-light-border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-brand-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">End Date *</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" value={booking.endDate}
                    onChange={(e) => setBooking((b) => ({ ...b, endDate: e.target.value }))}
                    className="w-full border border-light-border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-brand-400" />
                </div>
              </div>
              <button type="submit" disabled={bookingLoading}
                className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                {bookingLoading ? <LoadingSpinner size="sm" /> : "Request Booking"}
              </button>
              <p className="text-xs text-center text-light-muted">Provider must confirm before payment.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
