"use client";
/**
 * app/(dashboard)/bookings/[id]/page.jsx
 * Booking detail — status progress, actions (pay, cancel), and chat window.
 */
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, MessageSquare, CreditCard, X } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings.api";
import { messagesApi } from "@/lib/api/messages.api";
import { formatDate } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";
import useAuthStore from "@/store/useAuthStore";
import { connectSocket } from "@/lib/socket";

const STEPS = ["requested", "confirmed", "ongoing", "completed"];
const statusColors = {
  requested: "bg-blue-500",
  confirmed: "bg-emerald-500",
  ongoing:   "bg-amber-500",
  completed: "bg-slate-500",
  cancelled: "bg-red-400",
  rejected:  "bg-red-400",
  expired:   "bg-slate-400",
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const [booking, setBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [bRes, mRes] = await Promise.all([
          bookingsApi.getBookingById(id),
          messagesApi.getThread(id),
        ]);
        setBooking(bRes.data.data);
        setMessages((mRes.data.data || []).slice().reverse());
      } catch {
        setError("Failed to load booking.");
      } finally {
        setLoading(false);
      }
    }
    load();

    // Socket.IO for real-time chat
    const socket = connectSocket(accessToken);
    socketRef.current = socket;
    socket.emit("join_booking", id);
    socket.on("new_message", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });
    return () => {
      socket.off("new_message");
      socket.emit("leave_booking", id);
    };
  }, [id, accessToken]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setMsgLoading(true);
    try {
      const res = await messagesApi.sendMessage(id, newMsg.trim());
      setMessages((prev) => {
        if (prev.some((m) => m._id === res.data.data?._id)) return prev;
        return [...prev, res.data.data];
      });
      setNewMsg("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setMsgLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelLoading(true);
    try {
      await bookingsApi.cancelBooking(id, "Cancelled by traveler");
      setBooking((b) => ({ ...b, status: "cancelled" }));
      toast.success("Booking cancelled");
    } catch {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRazorpay = () => {
    if (!booking?.payment?.razorpayOrderId) {
      toast.error("Payment not yet set up for this booking");
      return;
    }
    if (typeof window.Razorpay === "undefined") {
      toast.error("Razorpay not loaded. Please refresh.");
      return;
    }
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: booking.amount * 100,
      currency: "INR",
      order_id: booking.payment?.razorpayOrderId,
      name: "AI TriConnect",
      description: `Booking: ${booking.provider?.title}`,
      handler: async (response) => {
        try {
          await bookingsApi.verifyPayment(id, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          setBooking((b) => ({ ...b, status: "confirmed", payment: { ...b.payment, status: "paid" } }));
          toast.success("Payment successful! Booking confirmed 🎉");
        } catch {
          toast.error("Payment verification failed");
        }
      },
      prefill: { name: user?.name, email: user?.email },
      theme: { color: "#6366f1" },
    };
    new window.Razorpay(options).open();
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (error || !booking) return <ErrorMessage message={error || "Booking not found."} />;

  const stepIdx = STEPS.indexOf(booking.status);

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-light-muted hover:text-slate-700 mb-4">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: Booking info + actions ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status card */}
          <div className="bg-white border border-light-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">Booking Status</h2>
              <span className={`text-xs text-white px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[booking.status] || "bg-slate-400"}`}>
                {booking.status}
              </span>
            </div>
            {/* Progress steps */}
            {!["cancelled","rejected","expired"].includes(booking.status) && (
              <div className="relative flex justify-between mb-4">
                <div className="absolute top-3 left-3 right-3 h-0.5 bg-slate-100 z-0" />
                <div
                  className="absolute top-3 left-3 h-0.5 bg-brand-500 z-0 transition-all"
                  style={{ width: `${(stepIdx / (STEPS.length - 1)) * 100}%` }}
                />
                {STEPS.map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-1 z-10">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      i <= stepIdx ? "bg-brand-500 border-brand-500 text-white" : "bg-white border-slate-200 text-slate-400"
                    }`}>
                      {i < stepIdx ? "✓" : i + 1}
                    </div>
                    <span className="text-xs text-light-muted capitalize hidden sm:block">{step}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-light-muted">Provider</span><span className="font-medium text-slate-700">{booking.provider?.title}</span></div>
              <div className="flex justify-between"><span className="text-light-muted">Dates</span><span className="font-medium text-slate-700">{formatDate(booking.startDate)} – {formatDate(booking.endDate)}</span></div>
              <div className="flex justify-between"><span className="text-light-muted">Amount</span><span className="font-bold text-brand-600">{formatCurrency(booking.amount)}</span></div>
              <div className="flex justify-between"><span className="text-light-muted">Payment</span>
                <span className={`font-medium capitalize ${booking.payment?.status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                  {booking.payment?.status || "pending"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 space-y-2">
              {booking.status === "confirmed" && booking.payment?.status === "pending" && (
                <button onClick={handleRazorpay}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  <CreditCard size={16} /> Pay Now
                </button>
              )}
              {["requested", "confirmed"].includes(booking.status) && (
                <button onClick={handleCancel} disabled={cancelLoading}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                  {cancelLoading ? <LoadingSpinner size="sm" /> : <><X size={15} /> Cancel Booking</>}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Chat window ── */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-light-border rounded-xl flex flex-col" style={{ height: "480px" }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-light-border">
              <MessageSquare size={16} className="text-brand-500" />
              <span className="font-semibold text-slate-800 text-sm">Chat with Provider</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-light-muted text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                  return (
                    <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                        isMe ? "bg-brand-500 text-white rounded-br-sm" : "bg-slate-100 text-slate-700 rounded-bl-sm"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Send */}
            <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 border-t border-light-border">
              <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-light-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
              />
              <button type="submit" disabled={msgLoading || !newMsg.trim()}
                className="p-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl transition-colors">
                {msgLoading ? <LoadingSpinner size="sm" /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
