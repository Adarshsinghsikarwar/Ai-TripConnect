/**
 * app/page.jsx
 * Landing page — public, no auth required.
 * Showcases the AI TriConnect platform with a hero, features, and CTA.
 */
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Bot,
  Shield,
  CreditCard,
  Star,
  ArrowRight,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Itinerary Generation",
    description:
      "Tell the AI your destination and interests. Get a day-by-day plan with real local providers suggested from our marketplace.",
    badge: "AI",
  },
  {
    icon: Bot,
    title: "AI Travel Assistant",
    description:
      "Chat with your AI travel agent 24/7. It searches our real provider and review data before answering — no hallucinations.",
    badge: "AI",
  },
  {
    icon: MapPin,
    title: "Smart Search",
    description:
      'Type "cheap guide in Goa under ₹1500" and our AI parses your query into filters and finds the best matches instantly.',
    badge: "AI",
  },
  {
    icon: Shield,
    title: "Verified Providers",
    description:
      "Every guide, driver, and homestay is manually verified by our admin team before going live. Trust matters.",
    badge: null,
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Razorpay-powered checkout with UPI, cards, and netbanking. Your money is held safely until the trip is confirmed.",
    badge: null,
  },
  {
    icon: Star,
    title: "AI Review Summaries",
    description:
      "No time to read 50 reviews? Our AI summarizes real traveler feedback into 2-3 honest sentences about every provider.",
    badge: "AI",
  },
];

const stats = [
  { label: "AI Features", value: "5+" },
  { label: "Service Types", value: "6" },
  { label: "Payment Methods", value: "UPI & More" },
  { label: "Response Time", value: "24h" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">AI TriConnect</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="gradient-hero pt-32 pb-20 px-4 text-center relative overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30 text-brand-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Zap size={14} />
            5 AI Features Powered by Mistral AI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Plan Smarter Trips with{" "}
            <span className="text-gradient">AI TriConnect</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            The AI-powered travel platform that connects travelers with verified
            local guides, drivers, and homestays across India — with real-time
            chat, Razorpay payments, and AI itinerary planning.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:shadow-glow-brand"
            >
              Start Planning for Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/providers"
              className="inline-flex items-center gap-2 border border-white/20 text-slate-300 hover:border-white/40 hover:text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all"
            >
              Browse Providers
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-surface-card border-y border-surface-border py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">
              Everything You Need to Plan the Perfect Trip
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From AI-generated itineraries to verified provider bookings and
              real-time chat — all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface-card border border-surface-border rounded-2xl p-6 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                    <feature.icon size={20} className="text-brand-400" />
                  </div>
                  {feature.badge && (
                    <span className="ai-badge">{feature.badge}</span>
                  )}
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center bg-surface-card border border-brand-500/30 rounded-2xl p-12 ai-glow">
          <Sparkles className="text-brand-400 mx-auto mb-4" size={32} />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Plan Your Next Adventure?
          </h2>
          <p className="text-slate-400 mb-8">
            Join AI TriConnect and let our AI plan your perfect trip while you
            connect with the best local providers.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-xl font-semibold transition-all hover:shadow-glow-brand"
          >
            Create Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-border py-8 px-4 text-center text-slate-500 text-sm">
        <p>© 2025 AI TriConnect Platform. Built with ❤️ for Indian travelers.</p>
      </footer>
    </div>
  );
}
