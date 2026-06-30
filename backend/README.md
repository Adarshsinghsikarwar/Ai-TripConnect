# TripConnect Backend

Full backend for a trip-planning + service-marketplace platform: traveler/provider auth (JWT + Google OAuth), provider marketplace with geospatial search, bookings with Razorpay payments (signature-verified, webhook-driven), AI itinerary generation (Claude API), real-time chat (Socket.IO), reviews, notifications, and an admin analytics layer — all built on the repository-pattern architecture from the earlier MVP.

## Architecture

```
route -> controller -> service -> repository -> model
```

```
src/
  config/        env, db, passport (Google OAuth), cloudinary
  models/        User, Provider, Trip, Booking, Itinerary, Expense, Review, Message, Notification
  repositories/  the ONLY layer that talks to Mongoose
  services/      business rules - auth, booking lifecycle, payments, AI, etc.
  controllers/   parse req -> call service -> shape res
  routes/        endpoint wiring + middleware chains
  middlewares/   auth, role, validation, rate limiting, upload, error handling
  validators/    express-validator chains per route group
  sockets/       Socket.IO chat handlers (JWT-authenticated)
  jobs/          background jobs (booking auto-expiry)
  utils/         ApiError, ApiResponse, asyncHandler, JWT helpers, logger
```

## Setup

```bash
npm install
cp .env.example .env   # fill in real secrets (see below)
npm run dev
```

You'll need accounts/keys for: MongoDB Atlas, Google Cloud Console (OAuth), Razorpay, Cloudinary, Anthropic (Claude API), and an SMTP provider (Resend/SendGrid/etc - optional, app degrades gracefully without it).

## Security measures implemented (and why)

| Concern | Implementation |
|---|---|
| **NoSQL injection** | `express-mongo-sanitize` strips any `$`-prefixed keys from body/query/params before they reach a query |
| **Brute-force login** | Per-account lockout after 5 failed attempts (15 min) **+** global `express-rate-limit` on `/auth/*` (independent layers - one can't be bypassed by defeating the other) |
| **Refresh token theft** | Refresh token is `httpOnly`/`sameSite:strict` cookie (never readable by JS); server stores only a bcrypt **hash** of it; reuse of a rotated token kills the whole session |
| **Payment spoofing** | Razorpay checkout signature verified server-side (HMAC) before trusting payment success; **webhook** signature also verified independently against the raw request body - this is the actual source of truth, not the client redirect |
| **Race conditions in booking accept/cancel** | `findOneAndUpdate` with the *expected current status* as part of the filter (atomic conditional update) - two concurrent requests can't both "win" |
| **XSS via chat / reviews** | `sanitize-html` strips all HTML from free-text fields (chat messages); no field is ever rendered as raw HTML server-side |
| **HTTP parameter pollution** | `hpp` middleware |
| **Mass-assignment of trust fields** | Provider self-update explicitly deletes `verificationStatus`/`avgRating`/`reviewCount` from the update payload before it reaches the repository - only the admin verification route can set these |
| **File upload abuse** | Multer limits: 5MB/file, 5 files max, image MIME types only, Cloudinary resizes server-side |
| **Missing secrets at boot** | `config/env.js` exits the process immediately if required secrets aren't set - fails at startup, not mid-request |
| **Stack trace leakage** | Error middleware only includes `stack` outside production |
| **Ownership checks** | Every update/delete repository method filters by `{ _id, user/traveler/provider }` together - you cannot patch someone else's resource by guessing an ID |

## Key flows

### Auth (password + Google OAuth, unified)
Both paths converge on the same `_issueTokenPair()` - every protected route only ever checks one kind of token, regardless of how the user originally signed up.
- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`
- `GET /api/v1/auth/google` -> Google consent screen -> `GET /api/v1/auth/google/callback` -> redirects to frontend with an access token
- `POST /api/v1/auth/refresh` - rotates the refresh cookie, issues new access token
- `POST /api/v1/auth/logout`

### Provider marketplace
- `POST /api/v1/providers` - create profile (status: `pending` until admin verifies)
- `GET /api/v1/providers/search?lng=&lat=&radiusKm=&serviceType=&city=&minPrice=&maxPrice=` - geospatial + filtered search, paginated
- `POST /api/v1/providers/:id/photos` - multipart upload straight to Cloudinary
- `PATCH /api/v1/providers/:id/verify` - admin-only

### Booking lifecycle
```
requested -> (provider accepts) -> confirmed -> (payment verified) -> ongoing -> completed
                v (provider rejects)                     v (either party cancels, anytime before completed)
            rejected                                 cancelled (auto-refunded if already paid)
```
Unanswered requests auto-`expire` after 24h via the background job in `jobs/bookingExpiry.job.js`.

### AI Itinerary
`POST /api/v1/itineraries/generate` calls Claude with a structured prompt, parses the JSON response, then **cross-references your own verified providers** in that destination so suggested stops link back to real, bookable listings - not generic advice that sends users elsewhere.

### Real-time chat
Socket.IO connections authenticate via the same JWT access token (`socket.handshake.auth.token`). Every message is still re-validated server-side against actual booking participants - joining a socket room grants no access by itself.

## Things to decide before production

- **Payout mechanism**: this implementation holds full payment and computes the provider's cut (`providerPayoutAmount`) but doesn't auto-transfer it - wire up Razorpay Route (or a manual payout process) before going live.
- **Refresh token cookie + cross-origin**: if your frontend and backend end up on different domains in production, you'll need `sameSite: 'none'` + `secure: true` and a proper CORS allowlist (currently single-origin via `CLIENT_URL`).
- **Provider verification**: currently a manual admin action via API - you'll want an actual admin UI or at least a Postman-driven workflow for this early on.

## Endpoint reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/v1/auth/register | - | Email/password signup |
| POST | /api/v1/auth/login | - | Email/password login |
| GET | /api/v1/auth/google | - | Start Google OAuth |
| GET | /api/v1/auth/google/callback | - | Google OAuth callback |
| POST | /api/v1/auth/refresh | refresh cookie | Rotate tokens |
| POST | /api/v1/auth/logout | access token | Invalidate session |
| POST | /api/v1/providers | access token | Register as a provider |
| GET | /api/v1/providers/search | - | Search/filter providers |
| GET | /api/v1/providers/:id | - | Provider public profile |
| PATCH | /api/v1/providers/:id | access token (owner) | Update own provider profile |
| POST | /api/v1/providers/:id/photos | access token (owner) | Upload photos |
| PATCH | /api/v1/providers/:id/verify | admin | Approve/reject provider |
| POST | /api/v1/trips | access token | Create a trip |
| GET | /api/v1/trips | access token | List my trips |
| POST | /api/v1/itineraries/generate | access token | AI itinerary for a trip |
| GET | /api/v1/itineraries/trip/:tripId | access token | Get itinerary |
| POST | /api/v1/bookings | access token | Request a booking |
| PATCH | /api/v1/bookings/:id/respond | access token (provider) | Accept/reject |
| POST | /api/v1/bookings/:id/verify-payment | access token | Confirm checkout signature |
| PATCH | /api/v1/bookings/:id/cancel | access token | Cancel (auto-refund if paid) |
| PATCH | /api/v1/bookings/:id/complete | access token (provider) | Mark trip done |
| GET | /api/v1/bookings/mine/traveler | access token | My bookings as traveler |
| GET | /api/v1/bookings/mine/provider | access token | My bookings as provider |
| POST | /api/v1/webhooks/razorpay | webhook signature | Razorpay payment events |
| POST | /api/v1/reviews | access token | Review a completed booking |
| GET | /api/v1/reviews/provider/:providerId | - | Reviews for a provider |
| GET/POST | /api/v1/messages/:bookingId | access token | Chat thread (also via Socket.IO) |
| GET | /api/v1/analytics/dashboard | admin | Revenue/booking facet dashboard |
| GET | /api/v1/analytics/top-providers | admin | Top rated providers |
| GET | /api/v1/analytics/pending-verifications | admin | Providers awaiting review |
