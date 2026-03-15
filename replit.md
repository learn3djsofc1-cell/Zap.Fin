# Zap.Fin

A crypto finance web dApp built with React, Vite, TypeScript, and Tailwind CSS. Features a marketing landing page, authentication, and a full dashboard application for managing crypto cards, wallets, and top-ups.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router DOM v7 (client-side SPA routing)
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite)
- **Animations**: Framer Motion (scroll-triggered section transitions, staggered card reveals, hero entrance animations)
- **3D**: React Three Fiber + Three.js
- **Icons**: Lucide React
- **Backend**: Express 4 with TypeScript (run via tsx)
- **Database**: PostgreSQL (Replit built-in)
- **Auth**: express-session + connect-pg-simple (session-based), bcrypt for password hashing
- **AI**: @google/genai (Gemini API key via GEMINI_API_KEY env var)

## Project Structure

```
/
├── index.html              # HTML entry point with full SEO meta tags
├── src/
│   ├── main.tsx            # React entry with BrowserRouter, AuthProvider, Routes
│   ├── App.tsx             # Landing page (all marketing sections)
│   ├── index.css           # Global styles
│   ├── auth/
│   │   ├── AuthContext.tsx  # AuthProvider + useAuth hook (login/signup/logout/me)
│   │   ├── LoginPage.tsx    # /login — Email + password sign in
│   │   ├── SignupPage.tsx   # /signup — Account creation with confirm password
│   │   └── ProtectedRoute.tsx # Redirects to /login if not authenticated
│   └── dashboard/
│       ├── DashboardLayout.tsx  # Shared layout: sidebar (desktop), bottom nav (mobile)
│       ├── OverviewPage.tsx     # /app — Balance, card preview, activity (empty states)
│       ├── CardsPage.tsx        # /app/cards — Card creation CTA (empty state)
│       ├── TopupsPage.tsx       # /app/topups — Wallet creation CTA (empty state)
│       └── ControlsPage.tsx     # /app/controls — Card controls CTA (empty state)
├── server/
│   ├── index.ts            # Express server entry point (port 3001)
│   ├── tsconfig.json       # Separate TS config for server code
│   └── routes/
│       └── auth.ts         # Auth API: signup, login, logout, me
├── vite.config.ts          # Vite config with /api proxy to Express
├── tsconfig.json           # Frontend TS config (excludes server/)
└── package.json            # Dependencies and scripts
```

## Routes

- `/` — Landing page (marketing site, public)
- `/login` — Login page (public)
- `/signup` — Signup page (public)
- `/app` — Dashboard Overview (protected, requires auth)
- `/app/cards` — My Cards (protected)
- `/app/topups` — Top-up Balance / Wallet (protected)
- `/app/controls` — Card Controls (protected)

## API Endpoints

- `POST /api/auth/signup` — Create account (email + password)
- `POST /api/auth/login` — Sign in (returns user, sets session cookie)
- `POST /api/auth/logout` — Sign out (destroys session)
- `GET /api/auth/me` — Get current user (401 if not authenticated)
- `GET /api/health` — Health check

## Database Schema

- **users**: id (serial PK), email (unique), password_hash, created_at
- **cards**: id (serial PK), user_id (FK), card_number, cvv, expiry, name, frozen, online_payments, contactless, created_at
- **wallets**: id (serial PK), user_id (FK unique), address, encrypted_private_key, confirmed, created_at
- **session**: sid (PK), sess (JSON), expire — managed by connect-pg-simple

## Development

- **Dev server**: `npm run dev` → starts Express on port 3001 + Vite on port 5000
- **Vite proxies** `/api/*` requests to Express backend
- **Build**: `npm run build` → outputs to `dist/`
- **Lint**: `npm run lint`

## Deployment

Configured as a **static** site deployment:
- Build command: `npm run build`
- Public directory: `dist`
- Note: Production deployment requires separate Express server hosting

## Brand Assets (public/)

- `logo.png` — Zap.Fin logo (favicon + navbar + inline)
- `netflix.png`, `usdc.png`, `usdt.png` — Brand logos used in dashboard mockups
- `spotify.png`, `airbnb.png`, `apple.png`, `telegram.jpg` — Brand logos used in Rewards & Referrals card

## Social Links

- Twitter/X: https://x.com/ZapFinBank

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-set by Replit)
- `HELIUS_API_KEY` — Helius RPC API key for Solana
- `COINGECKO_API_KEY` — CoinGecko API key for price data
- `GEMINI_API_KEY` — Gemini AI API key (optional)
- `SESSION_SECRET` — Express session secret (defaults to dev fallback)
