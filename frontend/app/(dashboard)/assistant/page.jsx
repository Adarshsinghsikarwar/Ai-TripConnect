"use client";
/**
 * app/(dashboard)/assistant/page.jsx
 * AI Travel Assistant — RAG chatbot powered by Mistral.
 */
import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import toast from "react-hot-toast";
import { assistantApi } from "@/lib/api/assistant.api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const SUGGESTIONS = [
  "Find me a guide in Goa under ₹1500",
  "What should I pack for Manali in December?",
  "Is there a good homestay near Coorg?",
  "What are my booking confirmations?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI Travel Assistant 👋 I can search our real provider and review data to give you grounded answers. Ask me about local guides, homestays, packing tips, or your bookings!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (question) => {
    const q = question || input.trim();
    if (!q) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await assistantApi.ask(q);
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.data.answer }]);
    } catch (err) {
      const msg = err.response?.data?.message || "The assistant is temporarily unavailable.";
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">AI Travel Assistant</h1>
            <span className="ai-badge">AI</span>
          </div>
          <p className="text-xs text-light-muted">Powered by Mistral AI · Searches real provider & review data</p>
        </div>
      </div>

      {/* Suggestion chips */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 px-3 py-1.5 rounded-full transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white border border-light-border rounded-2xl p-4 space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={14} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-500 text-white rounded-br-sm"
                  : "bg-slate-50 text-slate-700 rounded-bl-sm border border-light-border"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={14} className="text-slate-600" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="bg-slate-50 border border-light-border px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-xs text-light-muted">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        className="flex gap-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about providers, guides, trips, bookings..."
          disabled={loading}
          className="flex-1 border border-light-border rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-brand-400 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl transition-colors"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Send size={18} />}
        </button>
      </form>
      <p className="text-center text-xs text-light-muted mt-2">
        AI responses are grounded in real platform data. Never invents providers or prices.
      </p>
    </div>
  );
}
