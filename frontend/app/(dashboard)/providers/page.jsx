"use client";
/**
 * app/(dashboard)/providers/page.jsx
 * Browse & search providers — regular search + AI smart search.
 */
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Sparkles, Star, MapPin, Filter, X } from "lucide-react";
import toast from "react-hot-toast";
import { providersApi } from "@/lib/api/providers.api";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import LoadingSpinner, { Skeleton } from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";

const SERVICE_TYPES = ["", "guide", "driver", "homestay", "planner", "photographer", "other"];
const verificationBadge = { verified: "text-emerald-600 bg-emerald-50", pending: "text-amber-600 bg-amber-50", rejected: "text-red-600 bg-red-50" };

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("filter"); // "filter" | "smart"
  // Filter search state
  const [city, setCity] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  // Smart search state
  const [smartQuery, setSmartQuery] = useState("");
  const [interpretedFilters, setInterpretedFilters] = useState(null);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (city) params.city = city;
      if (serviceType) params.serviceType = serviceType;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await providersApi.search(params);
      setProviders(res.data.data?.results || res.data.data || []);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [city, serviceType, minPrice, maxPrice]);

  const doSmartSearch = async (e) => {
    e.preventDefault();
    if (!smartQuery.trim()) return;
    setLoading(true);
    setError(null);
    setInterpretedFilters(null);
    try {
      const res = await providersApi.smartSearch({ q: smartQuery });
      setProviders(res.data.data?.results || res.data.data || []);
      setInterpretedFilters(res.data.data?.interpretedFilters);
    } catch (err) {
      const msg = err.response?.data?.message || "Smart search failed.";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { doSearch(); }, [doSearch]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Find Service Providers</h1>
        <p className="text-light-muted text-sm mt-1">
          Verified local guides, drivers, homestays, and more across India.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("filter")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === "filter" ? "bg-slate-800 text-white" : "bg-white border border-light-border text-slate-600 hover:border-slate-300"}`}
        >
          <Filter size={14} /> Filters
        </button>
        <button
          onClick={() => setMode("smart")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === "smart" ? "bg-brand-500 text-white" : "bg-white border border-light-border text-slate-600 hover:border-brand-300"}`}
        >
          <Sparkles size={14} /> AI Smart Search <span className="ai-badge">AI</span>
        </button>
      </div>

      {/* Search UI */}
      {mode === "smart" ? (
        <form onSubmit={doSmartSearch} className="bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-200 rounded-xl p-4 mb-6">
          <p className="text-xs text-brand-700 mb-2 font-medium">Describe what you need in plain language:</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Sparkles size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
              <input
                value={smartQuery}
                onChange={(e) => setSmartQuery(e.target.value)}
                placeholder='e.g. "budget guide in Goa under ₹1500 for a family trip"'
                className="w-full bg-white border border-brand-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:border-brand-400"
              />
            </div>
            <button type="submit" disabled={loading} className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors">
              {loading ? <LoadingSpinner size="sm" /> : "Search"}
            </button>
          </div>
          {interpretedFilters && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs text-brand-600 font-medium">Understood as:</span>
              {Object.entries(interpretedFilters).map(([k, v]) => v && (
                <span key={k} className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full capitalize">
                  {k}: {v}
                </span>
              ))}
            </div>
          )}
        </form>
      ) : (
        <div className="bg-white border border-light-border rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative col-span-2 md:col-span-1">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()}
              placeholder="City" className="w-full border border-light-border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-brand-400" />
          </div>
          <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}
            className="border border-light-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-400 capitalize">
            {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t || "All Types"}</option>)}
          </select>
          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min ₹/day" className="border border-light-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-400" />
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max ₹/day" className="border border-light-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-400" />
          <button onClick={doSearch} className="col-span-2 md:col-span-4 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            <Search size={14} /> Search
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={doSearch} />
      ) : providers.length === 0 ? (
        <div className="text-center py-12 text-light-muted">
          <Search size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-700">No providers found</p>
          <p className="text-sm mt-1">Try adjusting your search or city.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => (
            <Link key={p._id} href={`/providers/${p._id}`}
              className="block bg-white border border-light-border rounded-xl overflow-hidden card-hover group">
              {/* Photo */}
              <div className="h-36 bg-gradient-to-br from-brand-100 to-violet-100 relative">
                {p.photos?.[0] ? (
                  <img src={p.photos[0]} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin size={32} className="text-brand-300" />
                  </div>
                )}
                <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${verificationBadge[p.verificationStatus] || ""}`}>
                  {p.verificationStatus}
                </span>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800 text-sm group-hover:text-brand-600 line-clamp-1 transition-colors">{p.title}</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize flex-shrink-0">{p.serviceType}</span>
                </div>
                <p className="text-xs text-light-muted flex items-center gap-1 mb-2">
                  <MapPin size={10} /> {p.location?.city || "India"}
                </p>
                {p.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{p.description}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-slate-700">
                      {p.avgRating ? Number(p.avgRating).toFixed(1) : "New"}
                    </span>
                    {p.reviewCount > 0 && <span className="text-xs text-light-muted">({p.reviewCount})</span>}
                  </div>
                  <span className="text-sm font-bold text-brand-600">{formatCurrency(p.pricePerDay)}/day</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
