"use client";
/**
 * app/(dashboard)/provider-dashboard/register/page.jsx
 * Become a provider — form to create a provider profile.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, DollarSign, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { providersApi } from "@/lib/api/providers.api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { FieldError } from "@/components/shared/ErrorMessage";

const SERVICE_TYPES = ["guide", "driver", "homestay", "planner", "photographer", "other"];

export default function RegisterProviderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", serviceType: "guide", description: "",
    pricePerDay: "", city: "", address: "",
    longitude: "", latitude: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.pricePerDay || form.pricePerDay <= 0) e.pricePerDay = "Valid price required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.longitude || !form.latitude) e.coords = "Coordinates are required for map search";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await providersApi.registerProvider({
        title: form.title,
        serviceType: form.serviceType,
        description: form.description,
        pricePerDay: Number(form.pricePerDay),
        location: {
          type: "Point",
          coordinates: [Number(form.longitude), Number(form.latitude)],
          address: form.address,
          city: form.city,
        },
      });
      toast.success("Provider profile created! Admin will verify it shortly.");
      router.push("/provider-dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Become a Service Provider</h1>
        <p className="text-light-muted text-sm mt-1">List your service and get discovered by travelers across India.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Your profile will be reviewed by our admin team before going live. This usually takes 24-48 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-light-border rounded-xl p-6 space-y-5">
        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Service Type *</label>
          <select value={form.serviceType} onChange={set("serviceType")}
            className="w-full border border-light-border rounded-xl py-2.5 px-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400 capitalize">
            {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Listing Title *</label>
          <div className="relative">
            <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={form.title} onChange={set("title")} placeholder="e.g. Experienced Goa Beach Guide"
              className="w-full border border-light-border rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400" />
          </div>
          <FieldError message={errors.title} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea value={form.description} onChange={set("description")} rows={3}
            placeholder="Tell travelers about your service, experience, and what makes you special..."
            className="w-full border border-light-border rounded-xl py-2.5 px-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400 resize-none" />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Price per Day (₹) *</label>
          <div className="relative">
            <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="number" value={form.pricePerDay} onChange={set("pricePerDay")} min="1" placeholder="e.g. 1500"
              className="w-full border border-light-border rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400" />
          </div>
          <FieldError message={errors.pricePerDay} />
        </div>

        {/* Location */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Location *</label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={form.city} onChange={set("city")} placeholder="City (e.g. Goa)"
              className="w-full border border-light-border rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400" />
          </div>
          <FieldError message={errors.city} />
          <input value={form.address} onChange={set("address")} placeholder="Full address (optional)"
            className="w-full border border-light-border rounded-xl py-2.5 px-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="any" value={form.longitude} onChange={set("longitude")} placeholder="Longitude (e.g. 73.8)"
              className="border border-light-border rounded-xl py-2.5 px-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400" />
            <input type="number" step="any" value={form.latitude} onChange={set("latitude")} placeholder="Latitude (e.g. 15.5)"
              className="border border-light-border rounded-xl py-2.5 px-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400" />
          </div>
          <FieldError message={errors.coords} />
          <p className="text-xs text-light-muted">Find your coordinates at maps.google.com → right-click your location.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-2.5 rounded-xl border border-light-border text-slate-600 text-sm font-medium hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
            {loading ? <LoadingSpinner size="sm" /> : "Submit for Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
