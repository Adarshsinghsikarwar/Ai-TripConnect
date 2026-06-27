# TripConnect — Product & Technical Documentation
*A trip-planning and travel-service marketplace platform*

---

## 1. Vision

A platform where two kinds of people meet:

- **Travelers** who want to plan a trip from Point A to Point B at the best price, with AI helping them figure out the route, budget, and itinerary.
- **Service Providers** — local guides, drivers, homestay owners, trip planners, photographers — who list their services and get discovered by travelers.

Think of it as **"Airbnb's marketplace model" + "Google Trips' planning intelligence" + "an AI travel agent in your pocket."**

This single sentence should guide every feature decision: *if a feature doesn't help a traveler plan/book better, or doesn't help a provider get discovered/paid, question whether it belongs in v1.*

---

## 2. User Roles

| Role | What they do |
|---|---|
| **Traveler** | Signs up, plans trips, searches/books services, pays, reviews, journals |
| **Service Provider** | Registers a service (guide/driver/homestay/etc.), sets availability & pricing, accepts bookings, gets paid |
| **Admin** | Verifies providers, resolves disputes, monitors platform health, views analytics |

A single user can hold both roles (a guide who also travels) — model this as a `roles: ['traveler', 'provider']` array on the User document, not two separate tables.

---

## 3. Core Features — MVP (Build This First)

Goal: a traveler can sign up, plan a trip, find a provider, book, and pay. Nothing more.

### 3.1 Authentication
- Email/password signup with **access + refresh token** (already built)
- **Google OAuth** login (this is the most requested "easy login" — see §7)
- Optional: Facebook OAuth (lower priority, Google covers 80% of users in India)

### 3.2 Trip Planning
- Create a trip: origin, destination, dates, number of travelers, budget range
- **Route suggestions**: show 2–3 ways to travel (flight / train / bus / self-drive) with estimated cost and duration — pulled from third-party transport APIs
- **Budget calculator**: rough estimate of stay + transport + food based on destination and trip length
- Save trip as draft, edit, or finalize

### 3.3 Service Marketplace
- Provider registration: service type, location, price, availability calendar, photos, description
- Admin verification step (manual or doc-upload based) before a provider goes live — **trust matters more than speed here**
- Search/filter providers by destination, service type, price range, rating
- Provider profile page with reviews, photos, response time

### 3.4 Booking & Payment
- Traveler sends a booking request → provider accepts/rejects → payment captured on accept
- Payment gateway integration (Razorpay for India — see §7)
- Booking status lifecycle: `requested → confirmed → ongoing → completed → cancelled`
- Commission model: platform takes a cut (e.g., 10–15%) — decide this early, it affects the payment flow (split payments vs. full capture + manual payout)

### 3.5 Reviews
- Traveler reviews provider after a completed booking (one review per booking, not per provider — prevents review spam)
- Provider rating = aggregated average, shown on profile and in search ranking

---

## 4. V2 Features (After MVP Works)

### 4.1 AI-Powered Itinerary Generation
This is your headline AI feature. Flow:
1. Traveler inputs: destination, days, budget, interests (e.g., "adventure", "food", "relaxed")
2. AI (via LLM API) generates a day-by-day itinerary: places to visit, suggested order, rough time per stop, estimated cost
3. Traveler can edit/regenerate any day
4. Itinerary auto-suggests providers from your marketplace that match (e.g., "Day 2: Book a local guide for the fort tour" → links to actual providers in your DB)

This last point is the key business move — **AI recommendations should funnel back into your own marketplace**, not send users to external links.

### 4.2 AI Travel Chatbot
- A conversational assistant answering "what should I pack for Manali in December" or "is this guide good for families" by querying your own review/provider data + general knowledge
- Use RAG (Retrieval-Augmented Generation): feed the LLM your platform's actual provider/review data so answers are grounded in real listings, not hallucinated ones

### 4.3 Price Intelligence
- "This is a good time to book — prices are 20% lower than usual" type insights
- Needs historical pricing data first, so this only becomes meaningful after you have booking volume — don't build this before MVP has real data

### 4.4 Group Trip / Split Expense
- Multiple travelers join one trip plan
- Expense splitting (you've literally already built this aggregation logic in the backend — `$group` by category per trip extends naturally to per-person splits)

### 4.5 Real-time Chat
- Traveler ↔ provider messaging before/after booking (Socket.IO — you already have this in your stack)

### 4.6 Maps & Live Tracking
- Show provider locations and trip routes on a map (Mapbox/Google Maps)
- Optional: live location sharing during an ongoing trip for safety

### 4.7 Notifications
- Booking confirmations, payment receipts, trip reminders — push (FCM) + email (Resend/SendGrid) + optional SMS for critical alerts (OTP, booking confirmed)

---

## 5. V3 / Stretch Features

- **AI Safety Score** for destinations/providers based on review sentiment analysis
- **Multi-language support** (important for India — Hindi + regional languages)
- **Loyalty/referral program**
- **Provider analytics dashboard** (earnings, booking trends, busiest months)
- **Trip journal with auto-generated photo album** (AI captions/categorizes uploaded photos)
- **Dynamic pricing suggestions for providers** ("Increase your price by 10% — demand is high this week")

---

## 6. Recommended Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | **Next.js 14 (App Router)** | SSR for SEO on provider/destination pages, good DX, same React skills you already have |
| Backend | **Node.js + Express** | You've already built the repository-pattern backend — extend it, don't rebuild |
| Database | **MongoDB** | Flexible schema fits varied provider types (guide vs homestay vs driver have different fields); aggregation pipelines you've practiced map directly to analytics |
| Auth | **JWT (access+refresh) + Google OAuth** | Already implemented; OAuth adds via Passport.js or `next-auth` |
| Realtime | **Socket.IO** | Chat, live booking status updates |
| AI | **Anthropic Claude API / OpenAI API** | Itinerary generation, chatbot — Claude API is well-documented and has a generous free-tier-friendly pricing model for prototyping |
| File/Image storage | **Cloudinary** or AWS S3 | Provider photos, trip journal images |
| Caching | **Redis** | Cache search results, rate-limit OTP requests, session/refresh-token blocklist |
| Deployment | **Vercel** (frontend) + **Render/Railway** (backend) + **MongoDB Atlas** (DB) | Free tiers cover early-stage traffic comfortably |

**Why not Next.js full-stack (API routes) instead of separate Express backend?**
Since you already have a clean Express backend with repository pattern, keep it. Use Next.js purely as frontend (SSR/SSG), calling your Express API. This also means your backend can later serve a mobile app without rewriting anything.

---

## 7. Third-Party Services (Detailed)

| Need | Service | Notes |
|---|---|---|
| **Google Login** | Google Identity Platform (OAuth 2.0) | Free. Use `passport-google-oauth20` (Express) or `next-auth` (if doing auth in Next.js) |
| **Payments** | **Razorpay** | Best for India — UPI, cards, netbanking. Supports split payments (Razorpay Route) for the commission model in §3.4 |
| **Maps & Geocoding** | **Mapbox** or **Google Maps Platform** | Mapbox has a more generous free tier; Google Maps has better India POI data |
| **Transport/Route data** | **Google Distance Matrix API**, or scrape-free options like **RapidAPI's flight/train aggregators** | Flights/trains in India don't have a great unified free API — IRCTC has no public API; consider starting with manual estimated pricing and adding real APIs later |
| **AI / LLM** | **Anthropic Claude API** or **OpenAI API** | Itinerary generation, chatbot, RAG over your provider data |
| **Email** | **Resend** or **SendGrid** | Transactional emails — booking confirmations, OTP |
| **SMS/OTP** | **Twilio** or **MSG91** (cheaper for India) | Phone verification, critical alerts |
| **Push Notifications** | **Firebase Cloud Messaging (FCM)** | Free, works for web + mobile |
| **File Storage** | **Cloudinary** | Free tier covers image hosting + on-the-fly resizing for provider photos |
| **Hosting (Frontend)** | **Vercel** | Free tier, built for Next.js |
| **Hosting (Backend)** | **Render** or **Railway** | Free/cheap tier for Node APIs |
| **Database** | **MongoDB Atlas** | Free 512MB cluster, enough for MVP |
| **Error tracking** | **Sentry** | Free tier, catches production bugs early |
| **Analytics** | **PostHog** (self-hostable, generous free tier) or Google Analytics | Track funnel: signup → trip created → booking made |

---

## 8. System Architecture (High Level)

```
                    ┌─────────────────┐
                    │   Next.js App    │  (Vercel)
                    │  (Traveler +     │
                    │  Provider portal)│
                    └────────┬─────────┘
                             │ REST/HTTPS
                    ┌────────▼─────────┐
                    │  Express API     │  (Render/Railway)
                    │  (your existing  │
                    │  repo-pattern    │
                    │  backend)        │
                    └──┬──────┬─────┬──┘
                       │      │     │
            ┌──────────▼┐ ┌───▼───┐ ┌▼─────────────┐
            │ MongoDB   │ │ Redis │ │ External APIs │
            │ Atlas     │ │ Cache │ │ (Razorpay,    │
            │           │ │       │ │ Claude API,   │
            │           │ │       │ │ Maps, OAuth)  │
            └───────────┘ └───────┘ └────────────────┘
```

Keep it a **modular monolith**, not microservices. At your stage, microservices add deployment complexity with zero benefit — you don't have the traffic to need independent scaling yet. Split into services only when a specific part (e.g., AI itinerary generation) genuinely needs separate scaling.

---

## 9. Database Design (Core Collections)

Building on the models you already have (`User`, `Trip`, `Expense`, `Review`), add:

- **Provider** — extends User with `serviceType` (guide/driver/homestay/etc.), `pricing`, `availability`, `verificationStatus`, `location` (GeoJSON for map search)
- **Booking** — links Traveler + Provider + Trip, with `status`, `amount`, `commission`, `paymentId`
- **Itinerary** — AI-generated, linked to a Trip, array of day objects with stops/cost/notes
- **Message** — for chat, indexed by `bookingId` or `conversationId`
- **Notification** — type, read/unread, linked to user

Use **geospatial indexes** (`2dsphere`) on Provider's location field from day one — "providers near me" is a near-certain feature request.

---

## 10. Payment & Booking Flow (Detailed Scenario)

1. Traveler finds a guide, sends booking request with dates → status `requested`
2. Provider gets notification (push + email), accepts within a set window (e.g., 24h) or it auto-expires
3. On accept → traveler is prompted to pay → Razorpay checkout opens
4. Payment success → webhook hits your backend → booking status → `confirmed`, commission calculated, payout scheduled for provider (Razorpay Route can auto-split, or you hold full amount and manually payout post-trip — simpler for MVP)
5. Trip happens → traveler marks `completed` → review prompt triggers
6. Refund/cancellation policy needs explicit rules (e.g., full refund if cancelled 48h+ before) — build this as a config, not hardcoded, since you'll tune it

---

## 11. Safety & Trust (Don't Skip This)

This is a marketplace with strangers transacting — trust mechanisms aren't optional polish:

- **Provider verification**: ID upload + admin manual review before going live
- **In-app payments only** — don't let providers push travelers to pay "outside the app" (kills your commission and your dispute leverage)
- **Review authenticity**: only bookings with `completed` status can leave a review
- **Reporting/flagging** system for both travelers and providers
- **Emergency contact / live location sharing** during active trips (V2/V3, but flag it now in your data model so you don't retrofit later)

---

## 12. Suggested Roadmap

| Phase | Scope | Rough Timeline (solo dev, part-time) |
|---|---|---|
| **MVP** | Auth (incl. Google), trip CRUD, provider listing/search, booking + Razorpay, reviews | 4–6 weeks |
| **V2** | AI itinerary generation, chat, notifications, maps | 3–4 weeks |
| **V3** | Group trips, safety score, analytics dashboard, multi-language | ongoing |

Ship MVP without AI first. A working marketplace with zero AI is still a real product; an AI demo with no bookings is just a toy. Get the boring parts (auth, payments, booking lifecycle) rock solid, then layer AI on top.

---

## 13. Cost Reality Check (Free-Tier Strategy)

For a solo-dev MVP, this stack can run at **near-zero cost**:
- Vercel (frontend) — free
- Render/Railway (backend) — free or ~$5–7/mo
- MongoDB Atlas — free 512MB
- Razorpay — no monthly fee, only per-transaction cut
- Claude/OpenAI API — pay-per-use, a few dollars covers heavy testing
- Cloudinary, Resend, FCM, Sentry — all have workable free tiers

The only place costs can creep up is LLM API calls if itinerary generation is used heavily without caching — cache common destination itineraries rather than regenerating from scratch every time.
