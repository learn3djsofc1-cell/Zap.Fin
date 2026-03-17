# GhostLane

Privacy-focused cryptocurrency ecosystem platform built with React, Vite, TypeScript, and Tailwind CSS. Marketing landing page, documentation, and a full dashboard for managing privacy operations.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router DOM v7 (client-side SPA routing)
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite)
- **Animations**: Framer Motion (scroll-triggered section transitions, staggered card reveals, hero entrance animations, parallax effects)
- **Icons**: Lucide React
- **Font**: Chakra Petch (Google Fonts) set as --font-sans in index.css
- **Backend**: Express 4 with TypeScript (run via tsx)
- **Database**: PostgreSQL (Replit built-in)
- **Auth**: JWT (jsonwebtoken) + bcryptjs for password hashing
- **DB Driver**: pg (node-postgres) with connection pooling

## Brand

- **Name**: GhostLane
- **Main Accent**: #0AF5D6 (cyan), hover: #08D4B8
- **Background**: #000000 (primary), #0A0A0A (cards/sections), #050505 (alternate sections)
- **Font**: Chakra Petch (Google Fonts)
- **Logo**: public/ghostlane-logo.png
- **Social**: X/Twitter at https://x.com/GhostLane_
- **API Key Prefixes**: gl_live_ (production), gl_test_ (sandbox)
- **localStorage Token Key**: ghostlane_token

## Project Structure

```
/
├── index.html              # HTML entry point with SEO meta, OG/Twitter cards, structured data
├── src/
│   ├── main.tsx            # React entry with BrowserRouter, Routes, AuthProvider, ToastProvider
│   ├── App.tsx             # Landing page (Hero, Products, Ux402 Protocol, Why, How It Works, Technology, Supported Assets, Comparison, Security, FAQ, CTA, Footer)
│   ├── index.css           # Global styles, animations, scrollbar, Chakra Petch font
│   ├── auth/
│   │   ├── LoginPage.tsx   # /login - Sign in form
│   │   └── SignupPage.tsx  # /signup - Registration form
│   ├── lib/
│   │   ├── api.ts          # Centralized API client with JWT auth, auto-redirect on 401
│   │   ├── AuthContext.tsx  # Auth context/provider + ProtectedRoute component
│   │   └── toast.tsx       # Toast notification system (success/error/warning/info)
│   ├── components/
│   │   ├── Modal.tsx       # Reusable modal dialog
│   │   ├── ConfirmDialog.tsx # Delete confirmation dialog
│   │   ├── Skeleton.tsx    # Loading skeleton components
│   │   ├── CurrencyBadge.tsx # Currency display with logos
│   │   ├── ErrorBoundary.tsx # Error boundary component
│   │   └── EmptyState.tsx  # Empty state placeholder
│   ├── docs/
│   │   └── DocsPage.tsx    # /docs - Full platform documentation
│   └── dashboard/
│       ├── DashboardLayout.tsx  # Sidebar + bottom nav layout with Outlet, logout
│       ├── OverviewPage.tsx     # /app - Stats + recent activity (real API)
│       ├── AgentsPage.tsx       # /app/agents - Full CRUD agent management (real API)
│       ├── TransactionsPage.tsx # /app/transactions - Transaction list + create (real API)
│       ├── PoliciesPage.tsx     # /app/policies - Full CRUD policy management (real API)
│       ├── ApiKeysPage.tsx     # /app/api-keys - API key management (create/revoke)
│       └── IntegrationsPage.tsx # /app/integrations - OpenClaw + Claude integration config
├── public/
│   ├── ghostlane-logo.png  # GhostLane brand logo
│   └── ...                 # Favicons and other static assets
├── server/
│   ├── index.ts            # Express server entry: initializes DB, mounts all API routes
│   ├── db.ts               # PostgreSQL connection pool (pg)
│   ├── schema.ts           # Database schema initialization (users, agents, transactions, policies)
│   ├── auth.ts             # Auth routes (/api/auth/*) + JWT middleware
│   ├── validate.ts         # ID validation helpers
│   ├── routes/
│   │   ├── agents.ts       # CRUD /api/agents
│   │   ├── transactions.ts # GET+POST /api/transactions (immutable records)
│   │   ├── policies.ts     # CRUD /api/policies
│   │   ├── apiKeys.ts      # API key management routes
│   │   ├── integrations.ts # Integration configuration routes
│   │   └── overview.ts     # GET /api/overview (aggregated stats)
│   └── tsconfig.json       # Server TS config
├── vite.config.ts          # Vite config with /api proxy to Express
├── tsconfig.json           # Frontend TS config
└── package.json            # Dependencies and scripts
```

## Database Schema

- **users**: id (serial PK), email (unique), password_hash, name, created_at
- **agents**: id (serial PK), user_id (FK), name, agent_id_slug (unique per user), status, purpose, currency, balance, created_at, updated_at
- **transactions**: id (serial PK), user_id (FK), agent_id (FK nullable), tx_hash, recipient, amount, currency, status, latency_ms, created_at
- **policies**: id (serial PK), user_id (FK), name, policy_id_slug (unique per user), status, max_per_tx, daily_limit, monthly_limit, multi_sig, multi_sig_threshold, allowed_merchants[], allowed_currencies[], assigned_agent_ids[], created_at, updated_at
- **api_keys**: id (serial PK), user_id (FK), name, key_hash (bcrypt), key_prefix (first 12 chars), environment (live/test), last_used_at, revoked_at, created_at
- **integrations**: id (serial PK), user_id (FK), provider (openclaw/claude), status, config (jsonb), connected_at, updated_at

All tables enforce user_id isolation — users can only access their own data.
Supported currencies: USDC, SOL, ETH, USDT (with crypto token logos in CurrencyBadge component).

## Routes

- `/` Landing page (marketing site)
- `/docs` Platform documentation
- `/login` Sign in page
- `/signup` Registration page
- `/app` Dashboard overview (protected - requires auth)
- `/app/agents` Agent account management (protected)
- `/app/transactions` Transaction history (protected)
- `/app/policies` Spending policy management (protected)
- `/app/api-keys` API key management (protected)
- `/app/integrations` Integration configuration (protected)

## API Endpoints

- `GET /api/health` Health check
- `POST /api/auth/register` User registration (email, password, name)
- `POST /api/auth/login` User login (returns JWT)
- `GET /api/auth/me` Get current user (requires auth)
- `GET /api/agents` List user's agents (requires auth)
- `POST /api/agents` Create agent (requires auth)
- `PATCH /api/agents/:id` Update agent (requires auth)
- `DELETE /api/agents/:id` Delete agent (requires auth)
- `GET /api/transactions` List transactions with search/filter/pagination (requires auth)
- `POST /api/transactions` Create transaction (requires auth)
- `GET /api/policies` List user's policies (requires auth)
- `POST /api/policies` Create policy (requires auth)
- `PATCH /api/policies/:id` Update policy (requires auth)
- `DELETE /api/policies/:id` Delete policy (requires auth)
- `GET /api/overview` Dashboard stats + recent activity (requires auth)
- `GET /api/api-keys` List user's API keys (requires auth)
- `POST /api/api-keys` Create API key (requires auth, returns key once)
- `DELETE /api/api-keys/:id` Revoke API key (requires auth)
- `GET /api/integrations` List user's integrations (requires auth)
- `POST /api/integrations/:provider/connect` Connect integration (requires auth)
- `POST /api/integrations/:provider/disconnect` Disconnect integration (requires auth)
- `PATCH /api/integrations/:provider/config` Update integration config (requires auth)

## Auth System

- JWT stored in localStorage key `ghostlane_token` with 7-day expiry
- API client auto-injects Authorization header and redirects to /login on 401
- ProtectedRoute component wraps /app/* routes, redirecting unauthenticated users
- Passwords hashed with bcryptjs (10 rounds)

## Development

- **Dev server**: `npm run dev` starts Express on port 3001 + Vite on port 5000
- **Vite proxies** `/api/*` requests to Express backend
- **Build**: `npm run build` outputs to `dist/`
- **Lint**: `npm run lint`

## Deployment

Configured as a **static** site deployment:
- Build command: `npm run build`
- Public directory: `dist`

## Animation System

The landing page uses scroll-triggered animations built on Framer Motion:
- **RevealOnScroll**: Directional (up/down/left/right) fade+translate with `useInView`
- **ScaleReveal**: Scale-up fade with `useInView`
- **StaggerWrap**: Staggered children reveal using `motion` variants
- **Hero parallax**: `useScroll` + `useTransform` for vertical offset

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Individual DB connection params
- `JWT_SECRET` - Secret key for JWT signing (defaults to a dev fallback if not set)
