"use client";
/**
 * app/(dashboard)/trips/new/page.jsx
 * Create trip page with AI draft generation.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Wand2, MapPin, Calendar, DollarSign, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { tripsApi } from "@/lib/api/trips.api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { FieldError } from "@/components/shared/ErrorMessage";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  destination: z.string().min(2, "Please enter a destination"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  budget: z.coerce.number().min(1, "Budget must be greater than 0"),
}).refine((d) => new Date(d.startDate) <= new Date(d.endDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  // ── AI Draft generation ────────────────────────────────────────────────────
  const handleAiDraft = async () => {
    if (!aiNotes.trim()) {
      toast.error("Please write some notes about your trip first");
      return;
    }
    setAiLoading(true);
    try {
      const res = await tripsApi.generateAIDraft(aiNotes);
      const draft = res.data.data;
      if (draft.title) setValue("title", draft.title);
      if (draft.description) setValue("description", draft.description);
      if (draft.destination) setValue("destination", draft.destination);
      if (draft.suggestedBudget) setValue("budget", draft.suggestedBudget);
      toast.success("AI drafted your trip! Review and edit as needed.");
      setShowAiPanel(false);
    } catch (err) {
      const msg = err.response?.data?.message || "AI is unavailable. Try filling in manually.";
      toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  // ── Form submit ────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await tripsApi.createTrip(data);
      const newTrip = res.data.data;
      toast.success("Trip created successfully!");
      router.push(`/trips/${newTrip._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Plan a New Trip</h1>
        <p className="text-light-muted text-sm mt-1">Fill in the details or let AI generate a draft from your notes.</p>
      </div>

      {/* AI Draft panel */}
      <div className="bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-500" size={18} />
            <span className="font-medium text-brand-800 text-sm">AI Trip Draft</span>
            <span className="ai-badge">AI</span>
          </div>
          <button
            onClick={() => setShowAiPanel((v) => !v)}
            className="text-sm text-brand-600 hover:text-brand-500 font-medium"
          >
            {showAiPanel ? "Hide" : "Use AI"}
          </button>
        </div>
        {showAiPanel && (
          <div className="mt-3 space-y-3">
            <textarea
              value={aiNotes}
              onChange={(e) => setAiNotes(e.target.value)}
              placeholder='e.g. "5 days in Manali with my family, budget around ₹30,000, interested in adventure and local food"'
              rows={3}
              className="w-full bg-white border border-brand-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-brand-400 resize-none"
            />
            <button
              onClick={handleAiDraft}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {aiLoading ? <LoadingSpinner size="sm" /> : <Wand2 size={15} />}
              {aiLoading ? "Generating..." : "Generate Draft"}
            </button>
          </div>
        )}
      </div>

      {/* Trip Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-light-border rounded-xl p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Trip Title *</label>
          <div className="relative">
            <FileText size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              {...register("title")}
              placeholder="e.g. Family Manali Escape"
              className="w-full border border-light-border rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400 transition-colors"
            />
          </div>
          <FieldError message={errors.title?.message} />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Destination *</label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              {...register("destination")}
              placeholder="e.g. Manali, Himachal Pradesh"
              className="w-full border border-light-border rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400 transition-colors"
            />
          </div>
          <FieldError message={errors.destination?.message} />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date *</label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("startDate")}
                type="date"
                className="w-full border border-light-border rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400 transition-colors"
              />
            </div>
            <FieldError message={errors.startDate?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date *</label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("endDate")}
                type="date"
                className="w-full border border-light-border rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400 transition-colors"
              />
            </div>
            <FieldError message={errors.endDate?.message} />
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Budget (₹) *</label>
          <div className="relative">
            <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              {...register("budget")}
              type="number"
              min="1"
              placeholder="e.g. 30000"
              className="w-full border border-light-border rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400 transition-colors"
            />
          </div>
          <FieldError message={errors.budget?.message} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="What's special about this trip?"
            className="w-full border border-light-border rounded-xl py-2.5 px-4 text-slate-800 text-sm focus:outline-none focus:border-brand-400 resize-none transition-colors"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 rounded-xl border border-light-border text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            {loading ? <LoadingSpinner size="sm" /> : "Create Trip"}
          </button>
        </div>
      </form>
    </div>
  );
}
