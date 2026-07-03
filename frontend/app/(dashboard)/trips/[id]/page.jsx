"use client";
/**
 * app/(dashboard)/trips/[id]/page.jsx
 * Trip detail page — shows trip info, tabs for expenses and AI itinerary.
 */
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin, Calendar, DollarSign, Sparkles, Plus, Wand2,
  ArrowLeft, ChevronDown, ChevronUp, Clock, Wallet
} from "lucide-react";
import toast from "react-hot-toast";
import { tripsApi } from "@/lib/api/trips.api";
import { expensesApi } from "@/lib/api/expenses.api";
import { itineraryApi } from "@/lib/api/itinerary.api";
import { formatDate, getDaysBetween } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import LoadingSpinner, { Skeleton } from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const TABS = ["Overview", "Expenses", "AI Itinerary"];
const EXPENSE_CATEGORIES = ["food", "stay", "travel", "activity", "shopping", "other"];
const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];
const statusColors = {
  planned: "bg-blue-100 text-blue-700",
  ongoing: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function TripDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [itinerary, setItinerary] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genLoading, setGenLoading] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expandedDay, setExpandedDay] = useState(0);
  const [genForm, setGenForm] = useState({ destination: "", days: 3, budget: 15000, interests: "" });
  const [newExpense, setNewExpense] = useState({ category: "food", amount: "", note: "" });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [tripRes, expRes, itinRes] = await Promise.all([
          tripsApi.getTripById(id),
          expensesApi.getTripExpenses(id).catch(() => ({ data: { data: [] } })),
          itineraryApi.getItineraryForTrip(id).catch(() => ({ data: { data: null } })),
        ]);
        const t = tripRes.data.data;
        setTrip(t);
        setExpenses(expRes.data.data || []);
        setItinerary(itinRes.data.data);
        setGenForm((f) => ({
          ...f,
          destination: t.destination,
          days: getDaysBetween(t.startDate, t.endDate),
          budget: t.budget,
        }));
      } catch {
        setError("Failed to load trip.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (activeTab === "Expenses" && expenses.length) {
      expensesApi.getCategoryBreakdown(id)
        .then((r) => setBreakdown(r.data.data || []))
        .catch(() => {});
    }
  }, [activeTab, expenses, id]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await expensesApi.addExpense({ ...newExpense, trip: id, amount: Number(newExpense.amount) });
      setExpenses((prev) => [res.data.data, ...prev]);
      setNewExpense({ category: "food", amount: "", note: "" });
      setShowExpenseForm(false);
      toast.success("Expense added");
    } catch {
      toast.error("Failed to add expense");
    }
  };

  const handleGenerate = async () => {
    setGenLoading(true);
    try {
      const res = await itineraryApi.generateItinerary({
        tripId: id,
        destination: genForm.destination,
        days: Number(genForm.days),
        budget: Number(genForm.budget),
        interests: genForm.interests.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setItinerary(res.data.data);
      toast.success("AI itinerary generated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "AI itinerary generation failed");
    } finally {
      setGenLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (error) return <ErrorMessage message={error} onRetry={() => router.refresh()} />;
  if (!trip) return null;

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-light-muted hover:text-slate-700 mb-4 transition-colors">
        <ArrowLeft size={15} /> Back to Trips
      </button>

      {/* Hero card */}
      <div className="bg-white border border-light-border rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-800">{trip.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[trip.status] || ""}`}>
                {trip.status}
              </span>
            </div>
            <p className="text-slate-500 flex items-center gap-1.5">
              <MapPin size={14} /> {trip.destination}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-brand-600">{formatCurrency(trip.budget)}</p>
            <p className="text-xs text-light-muted">Total Budget</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-600 border-t border-light-border pt-4">
          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-brand-400" />
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
          </span>
          <span className="flex items-center gap-1.5"><Clock size={14} className="text-brand-400" />
            {getDaysBetween(trip.startDate, trip.endDate)} days
          </span>
          <span className="flex items-center gap-1.5"><Wallet size={14} className="text-emerald-500" />
            {formatCurrency(totalSpent)} spent
          </span>
        </div>
        {trip.description && <p className="mt-3 text-sm text-slate-600">{trip.description}</p>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? "bg-white shadow-sm text-brand-600" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "AI Itinerary" ? (
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles size={13} /> AI Itinerary
              </span>
            ) : tab}
          </button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {activeTab === "Overview" && (
        <div className="bg-white border border-light-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Trip Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Budget", value: formatCurrency(trip.budget), color: "text-brand-600" },
              { label: "Spent", value: formatCurrency(totalSpent), color: "text-amber-600" },
              { label: "Remaining", value: formatCurrency(trip.budget - totalSpent), color: "text-emerald-600" },
              { label: "Expenses", value: expenses.length, color: "text-slate-800" },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-4 text-center">
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-light-muted mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Expenses tab ── */}
      {activeTab === "Expenses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Expense Tracker</h3>
            <button
              onClick={() => setShowExpenseForm((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} /> Add Expense
            </button>
          </div>

          {/* Add expense form */}
          {showExpenseForm && (
            <form onSubmit={handleAddExpense} className="bg-brand-50 border border-brand-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense((p) => ({ ...p, category: e.target.value }))}
                    className="w-full border border-light-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-400 capitalize"
                  >
                    {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Amount (₹)</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="500"
                    required
                    className="w-full border border-light-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
              <input
                value={newExpense.note}
                onChange={(e) => setNewExpense((p) => ({ ...p, note: e.target.value }))}
                placeholder="Note (optional)"
                className="w-full border border-light-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-400"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowExpenseForm(false)} className="flex-1 py-2 border border-light-border rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium">Add</button>
              </div>
            </form>
          )}

          {/* Pie chart */}
          {breakdown.length > 0 && (
            <div className="bg-white border border-light-border rounded-xl p-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Spending Breakdown</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={breakdown} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={70} label={({ _id }) => _id}>
                    {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Expense list */}
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-light-muted text-sm">No expenses recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {expenses.map((exp) => (
                <div key={exp._id} className="flex items-center justify-between bg-white border border-light-border rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{exp.category}</span>
                    {exp.note && <span className="text-sm text-slate-600">{exp.note}</span>}
                  </div>
                  <span className="font-semibold text-slate-800">{formatCurrency(exp.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── AI Itinerary tab ── */}
      {activeTab === "AI Itinerary" && (
        <div className="space-y-4">
          {!itinerary ? (
            <div className="bg-white border border-light-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-brand-500" size={20} />
                <h3 className="font-semibold text-slate-800">Generate AI Itinerary</h3>
                <span className="ai-badge">AI</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                The AI will create a day-by-day plan and suggest real providers from our marketplace.
              </p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Destination</label>
                    <input value={genForm.destination} onChange={(e) => setGenForm((f) => ({ ...f, destination: e.target.value }))}
                      className="w-full border border-light-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Number of Days</label>
                    <input type="number" value={genForm.days} onChange={(e) => setGenForm((f) => ({ ...f, days: e.target.value }))}
                      className="w-full border border-light-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-400" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Budget (₹)</label>
                  <input type="number" value={genForm.budget} onChange={(e) => setGenForm((f) => ({ ...f, budget: e.target.value }))}
                    className="w-full border border-light-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Interests (comma-separated)</label>
                  <input value={genForm.interests} onChange={(e) => setGenForm((f) => ({ ...f, interests: e.target.value }))}
                    placeholder="adventure, food, relaxed"
                    className="w-full border border-light-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-400" />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={genLoading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  {genLoading ? <><LoadingSpinner size="sm" /> Generating itinerary...</> : <><Wand2 size={16} /> Generate Itinerary</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-brand-500" size={18} />
                  <span className="font-semibold text-slate-800">AI-Generated Itinerary</span>
                  <span className="ai-badge">AI</span>
                </div>
                <button onClick={() => setItinerary(null)} className="text-xs text-brand-600 hover:text-brand-500">Regenerate</button>
              </div>
              {(itinerary.days || []).map((day, i) => (
                <div key={i} className="bg-white border border-light-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedDay(expandedDay === i ? -1 : i)}
                    className="w-full flex items-center justify-between px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full gradient-brand text-white text-sm font-bold flex items-center justify-center">{day.dayNumber}</span>
                      <div className="text-left">
                        <p className="font-medium text-slate-800 text-sm">Day {day.dayNumber}</p>
                        <p className="text-xs text-light-muted">{day.summary}</p>
                      </div>
                    </div>
                    {expandedDay === i ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {expandedDay === i && (
                    <div className="px-5 pb-4 border-t border-light-border space-y-3">
                      {(day.stops || []).map((stop, j) => (
                        <div key={j} className="flex gap-3 py-2">
                          <div className="w-2 h-2 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{stop.name}</p>
                            <div className="flex gap-3 text-xs text-light-muted mt-0.5">
                              {stop.estimatedTime && <span>⏱ {stop.estimatedTime}</span>}
                              {stop.estimatedCost && <span>💰 {formatCurrency(stop.estimatedCost)}</span>}
                            </div>
                            {stop.notes && <p className="text-xs text-slate-500 mt-1 italic">{stop.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
