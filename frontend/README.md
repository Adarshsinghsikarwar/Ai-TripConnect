# AI TriConnect Platform — Frontend

A Next.js 14 frontend for the **AI TriConnect Platform** — an AI-powered trip-planning and travel-service marketplace.

---

## 🚀 Quick Start

### 1. Copy the environment file
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and set your backend URL and Razorpay key.

### 2. Install dependencies (already done)
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

> **Make sure your Express backend is running on port 5000** (or update `NEXT_PUBLIC_API_URL`).

---

## 📦 Technology Stack

| Tool | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework |
| Tailwind CSS | Styling |
| Zustand | Global state (auth, notifications) |
| Axios | HTTP client with auto token refresh |
| React Hook Form + Zod | Forms + validation |
| Recharts | Expense and analytics charts |
| Socket.IO Client | Real-time chat |
| React Hot Toast | Toast notifications |
| Lucide React | Icons |

---

## 📂 Folder Structure

```
frontend/
app/                     # Next.js App Router pages
  (auth)/                # Login, Register, OTP, Forgot Password
  (dashboard)/           # All authenticated pages
    dashboard/           # Home dashboard
    trips/               # My Trips + Create + Detail + Itinerary
    providers/           # Browse + AI Search + Profile
    bookings/            # My Bookings + Detail + Chat
    assistant/           # AI Travel Chatbot
    provider-dashboard/  # Provider management
    profile/             # User profile
  admin/                 # Admin dashboard + verifications
components/
  auth/                  # AuthProvider, ProtectedRoute
  layout/                # Sidebar, Topbar
  shared/                # LoadingSpinner, StarRating, ErrorMessage
lib/
  api/                   # One file per backend route group
    axios.js             # Central Axios + token refresh interceptor
    auth.api.js
    trips.api.js
    providers.api.js
    bookings.api.js
    expenses.api.js
    itinerary.api.js
    reviews.api.js
    assistant.api.js
    messages.api.js
    analytics.api.js
  utils/                 # formatCurrency, formatDate, cn
  socket.js              # Socket.IO client
store/                   # Zustand stores
  useAuthStore.js
  useNotificationStore.js
```

---

## 🤖 AI Features (5 total)

| Feature | Page | Backend Route |
|---|---|---|
| AI Trip Draft | Create Trip | POST /trips/ai-draft |
| AI Itinerary Generation | Trip Detail | POST /itineraries/generate |
| AI Smart Search | Browse Providers | GET /providers/search/smart |
| AI Review Summary | Provider Profile | GET /reviews/provider/:id/summary |
| AI Travel Chatbot | AI Assistant | POST /assistant/ask |

---

## 🎨 Color Design System

| Color | Hex | Use |
|---|---|---|
| Primary Indigo | #6366f1 | Buttons, AI features, active nav |
| Accent Amber | #f59e0b | CTA, star ratings |
| Success Emerald | #10b981 | Verified, paid |
| Dark BG | #0f172a | Sidebar, landing hero |
| Light BG | #f8fafc | Content area background |

---

## 🔐 Auth

- Access token in localStorage, refresh token as httpOnly cookie
- Axios auto-refreshes on 401
- Zustand persists auth state across reloads

## 💳 Razorpay

Add to app/layout.jsx for payments:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js" />
```
