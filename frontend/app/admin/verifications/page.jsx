"use client";
/**
 * app/admin/verifications/page.jsx
 * Admin: verify or reject pending provider profiles.
 */
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { analyticsApi } from "@/lib/api/analytics.api";
import { providersApi } from "@/lib/api/providers.api";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import LoadingSpinner, { Skeleton } from "@/components/shared/LoadingSpinner";

export default function VerificationsPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    analyticsApi.getPendingVerifications()
      .then((r) => setProviders(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handle = async (id, status) => {
    setActionLoading((p) => ({ ...p, [id]: status }));
    try {
      await providersApi.setVerification(id, status);
      setProviders((prev) => prev.filter((p) => p._id !== id));
      toast.success(`Provider ${status === "verified" ? "verified ✅" : "rejected ❌"}`);
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pending Verifications</h1>
        <p className="text-light-muted text-sm mt-1">Review and approve provider profiles before they go live.</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
      ) : providers.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="text-emerald-400 mx-auto mb-3" size={32} />
          <p className="font-medium text-slate-700">All caught up!</p>
          <p className="text-sm text-light-muted">No providers pending verification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((p) => (
            <div key={p._id} className="bg-white border border-light-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <MapPin size={17} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{p.title}</p>
                    <p className="text-xs text-light-muted capitalize">{p.serviceType} · {p.location?.city}</p>
                    <p className="text-xs text-light-muted mt-0.5">Owner: {p.user?.name} ({p.user?.email})</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-brand-600">{formatCurrency(p.pricePerDay)}/day</span>
              </div>

              {p.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{p.description}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handle(p._id, "verified")}
                  disabled={actionLoading[p._id]}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  {actionLoading[p._id] === "verified" ? <LoadingSpinner size="sm" /> : <CheckCircle size={15} />}
                  Verify & Publish
                </button>
                <button
                  onClick={() => handle(p._id, "rejected")}
                  disabled={actionLoading[p._id]}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  {actionLoading[p._id] === "rejected" ? <LoadingSpinner size="sm" /> : <XCircle size={15} />}
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
