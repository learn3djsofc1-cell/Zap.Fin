# GhostLane

Privacy-focused cryptocurrency ecosystem platform built with React, Vite, TypeScript, and Tailwind CSS. Marketing landing page, documentation, and a full dashboard for managing privacy operations across 4 core products: Mixer, Encrypted Messenger, Privacy Bridge, and VPN.

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
- **Background**: #000000 (primary) with #0AF5D6 gradient overlays on sections, #0A0A0A (cards)
- **Font**: Chakra Petch (Google Fonts)
- **Logo**: public/ghostlane-logo.png
- **Social**: X/Twitter at https://x.com/GhostLane_
- **localStorage Token Key**: ghostlane_token

## GhostLane Products

1. **Mixer** — Advanced cryptocurrency mixing with ZK proofs. Break transaction links with massive anonymity sets. Supports BTC, ETH, XMR, LTC, DASH, ZEC, BCH, DOGE.
2. **Encrypted Messenger** — E2E encrypted messaging with username-based contacts, real-time WebSocket delivery, disappearing messages, and zero metadata collection.
3. **Privacy Bridge** — Cross-chain asset transfers across 15+ chains with complete anonymity.
4. **Privacy Shield** — Railgun Protocol ZK-SNARK private transfers on EVM chains (Ethereum, Arbitrum, Polygon, BSC). Three operations: Shield (public→private), Transfer (private→private), Unshield (private→public). Real Railgun Relay Adapt contract addresses displayed. Shielded balance tracking, privacy score, operation history with ZK proof hashes.
5. **VPN** — Military-grade VPN with no-logs policy, kill switch, 24 global servers, SerpAPI-powered private search, session history with DB persistence.
6. **Ux402 Protocol** — Shielded Cross-Chain Facilitator on Ethereum (developer SDK).

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
│   │   ├── api.ts          # Centralized API client with typed interfaces for all products (mixer, messenger, bridge, vpn, settings, overview)
│   │   ├── websocket.ts    # WebSocket client: auto-reconnect with exponential backoff, event subscription
│   │   ├── AuthContext.tsx  # Auth context/provider + ProtectedRoute component
│   │   └── toast.tsx       # Toast notification system (success/error/warning/info)
│   ├── components/
│   │   ├── Modal.tsx       # Reusable modal dialog
│   │   ├── ConfirmDialog.tsx # Delete confirmation dialog
│   │   ├── Skeleton.tsx    # Loading skeleton components
│   │   ├── CurrencyBadge.tsx # Currency display with logos (BTC, ETH, XMR, LTC, DASH, ZEC, BCH, DOGE, USDC, USDT)
│   │   ├── DepositPendingModal.tsx # Animated deposit pending modal with SVG orbital spinner (Framer Motion)
│   │   ├── ErrorBoundary.tsx # Error boundary component
│   │   └── EmptyState.tsx  # Empty state placeholder
│   ├── docs/
│   │   └── DocsPage.tsx    # /docs - Full platform documentation
│   └── dashboard/
│       ├── DashboardLayout.tsx  # Sidebar (Products/Account groups) + bottom nav + mobile drawer
│       ├── OverviewPage.tsx     # /app - Privacy score, stat cards, product quick-launch, activity feed
│       ├── MixerPage.tsx        # /app/mixer - New mix form, coin selector, privacy levels, history
│       ├── MessengerPage.tsx    # /app/messenger - Conversation list, chat view, self-destruct, new chat
│       ├── BridgePage.tsx       # /app/bridge - Cross-chain form, chain swap, status tracker, history
│       ├── PrivacyShieldPage.tsx # /app/privacy - Railgun ZK-SNARK shield/transfer/unshield, balances, history
│       ├── VpnPage.tsx          # /app/vpn - Connection toggle, 24 global servers, real-time stats (duration, fingerprint, IP cloak, relayer), bandwidth, kill switch, SerpAPI private search, dApp session tracking with duration/status, session history with end-session control
│       └── SettingsPage.tsx     # /app/settings - Profile, security (password, 2FA, sessions), notifications
├── public/
│   ├── ghostlane-logo.png  # GhostLane brand logo
│   └── ...                 # Favicons and crypto logos
├── server/
│   ├── index.ts            # Express server entry: http.createServer, initializes DB, mounts API routes + WebSocket
│   ├── websocket.ts        # WebSocket server: JWT auth on upgrade, userId→connection map, heartbeat, sendToUser broadcast
│   ├── db.ts               # PostgreSQL connection pool (pg)
│   ├── schema.ts           # Database schema initialization (users, mix_operations tables)
│   ├── auth.ts             # Auth routes (/api/auth/*) + JWT middleware
│   ├── crypto-utils.ts     # Address validation & deposit address generation (ethers.js, crypto)
│   ├── coingecko.ts        # CoinGecko price service (60s TTL cache, rate conversion with 1.5% fee)
│   ├── validate.ts         # ID validation helpers
│   ├── routes/
│   │   ├── overview.ts     # GET /api/overview/stats (real DB), GET /api/overview/activity (real DB, "X BTC → Y ETH" format)
│   │   ├── mixer.ts        # Cross-asset swap CRUD /api/mixer (DB-backed), rates, validate-address, pools
│   │   ├── messenger.ts    # /api/messenger (conversations, messages, contacts)
│   │   ├── bridge.ts       # /api/bridge (create transfer, list, chains)
│   │   ├── railgun.ts      # /api/railgun (shield, transfer, unshield, operations, balances, stats, networks)
│   │   ├── vpn.ts          # /api/vpn (servers, session, connect, disconnect, kill-switch)
│   │   └── settings.ts     # /api/settings (profile, password, 2fa, sessions)
│   └── tsconfig.json       # Server TS config
├── vite.config.ts          # Vite config with /api proxy to Express
├── tsconfig.json           # Frontend TS config
└── package.json            # Dependencies and scripts
```

## Routes

- `/` Landing page (marketing site)
- `/docs` Platform documentation
- `/login` Sign in page
- `/signup` Registration page
- `/app` Dashboard overview (protected - requires auth)
- `/app/mixer` Cryptocurrency mixer (protected)
- `/app/messenger` Encrypted messenger (protected)
- `/app/bridge` Privacy bridge (protected)
- `/app/privacy` Privacy Shield - Railgun ZK-SNARK operations (protected)
- `/app/vpn` VPN management (protected)
- `/app/settings` Account settings (protected)

## API Endpoints

- `GET /api/health` Health check
- `POST /api/auth/register` User registration (email, password, name)
- `POST /api/auth/login` User login (returns JWT)
- `GET /api/auth/me` Get current user (requires auth)
- `GET /api/overview/stats` Dashboard stats (privacy score, totals)
- `GET /api/overview/activity` Recent activity feed
- `GET /api/mixer` List mix operations
- `POST /api/mixer` Create cross-asset swap (sendCoin, receiveCoin, sendAmount, recipientAddress, privacyLevel) — fetches live CoinGecko rates, generates deposit address for send coin, validates recipient against receive coin format
- `POST /api/mixer/validate-address` Validate recipient address by coin type
- `GET /api/mixer/rates` Live exchange rates from CoinGecko (60s cache)
- `GET /api/mixer/pools` Pool sizes
- `GET /api/mixer/:id` Get mix details
- `GET /api/messenger/conversations` List conversations (DB-backed, per user)
- `POST /api/messenger/conversations` Create conversation (by contactUserId, validates target user exists and is not self)
- `GET /api/messenger/users/search?q=` Search registered users by username (ILIKE, excludes self, limit 10)
- `GET /api/messenger/conversations/:id/messages` Get messages (DB-backed, ownership verified)
- `POST /api/messenger/conversations/:id/messages` Send message (DB-backed, updates conversation last_message, broadcasts to recipient via WebSocket)
- `WS /ws?token=JWT` WebSocket endpoint — JWT-authenticated upgrade, real-time events: new_message, conversation_update, new_conversation. Heartbeat ping/pong at 30s intervals.
- `GET /api/messenger/contacts` List contacts (derived from conversations)
- `GET /api/bridge` List bridge transfers
- `POST /api/bridge` Create bridge transfer
- `GET /api/bridge/chains` List supported chains
- `GET /api/railgun/networks` List Railgun-supported networks (Ethereum, Arbitrum, Polygon, BSC) with contract addresses
- `POST /api/railgun/shield` Shield tokens (public→private) — requires EVM source address
- `POST /api/railgun/transfer` Private transfer (private→private) — requires 0zk recipient address
- `POST /api/railgun/unshield` Unshield tokens (private→public) — requires EVM recipient address
- `GET /api/railgun/operations` List operations (filterable by type and status, paginated)
- `GET /api/railgun/balances` Computed shielded balances per network/token
- `GET /api/railgun/stats` Aggregated stats (total ops, privacy score, networks used)
- `GET /api/vpn/servers` List 24 global VPN servers (flag, latency, load, protocol)
- `GET /api/vpn/session` Get active VPN session (DB-backed with IP, fingerprint, relay)
- `POST /api/vpn/connect` Connect to VPN server (creates DB session)
- `POST /api/vpn/disconnect` Disconnect VPN (persists bandwidth data)
- `POST /api/vpn/kill-switch` Toggle kill switch (persisted per session)
- `GET /api/vpn/history` Session history (paginated)
- `POST /api/vpn/search` Private search via SerpAPI (requires active VPN)
- `POST /api/vpn/search/log-open` Log URL opened from search results
- `GET /api/vpn/searches` Search history for user
- `POST /api/vpn/end-session/:id` End active VPN session by ID (persists bandwidth, closes dApps)
- `POST /api/vpn/dapp/open` Track opening a dApp URL (creates dApp session)
- `POST /api/vpn/dapp/:id/close` Close active dApp session
- `GET /api/vpn/dapps` List dApp sessions (filter by status: active/closed/all)
- `GET /api/settings/profile` Get user profile
- `PATCH /api/settings/profile` Update profile
- `POST /api/settings/password` Change password
- `POST /api/settings/2fa` Toggle 2FA
- `GET /api/settings/sessions` List active sessions
- `DELETE /api/settings/sessions/:id` Revoke session

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

## Animation System

The landing page uses scroll-triggered animations built on Framer Motion:
- **RevealOnScroll**: Directional (up/down/left/right) fade+translate with `useInView`
- **ScaleReveal**: Scale-up fade with `useInView`
- **StaggerWrap**: Staggered children reveal using `motion` variants
- **Hero parallax**: `useScroll` + `useTransform` for vertical offset
- **Auth pages**: Framer Motion entrance animations (fade+slide up) on login/signup forms
- **Dashboard pages**: Framer Motion entrance animations on page load

## Visual Design System

- **Auth pages**: Full-bleed gradient backgrounds with multiple teal orbs, glassmorphism form cards with backdrop-blur, teal CTA buttons with black text and shadow glow
- **Dashboard layout**: Sidebar with subtle gradient overlay, user initials avatar with teal accent, nav items with active border+bg state, grouped nav (Products/Account), mobile bottom nav with drawer
- **Dashboard pages**: Consistent card styling with #0A0A0A bg, rounded-2xl corners, white/4% borders that glow on hover, stat cards with colored icon backgrounds, product-specific color coding (Mixer=purple, Messenger=blue, Bridge=green, VPN=orange)
- **Shared components**: Modal with backdrop-blur overlay, EmptyState with teal-tinted icon container, CurrencyBadge supports all crypto logos
- **Button convention**: Teal (#0AF5D6) primary buttons always use text-black; secondary buttons use bg-white/4% with text-gray-400; destructive buttons use red accents

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Individual DB connection params
- `JWT_SECRET` - Secret key for JWT signing (defaults to a dev fallback if not set)
- `DEPOSIT_KEY_SECRET` - AES-256 encryption key for deposit private keys (defaults to a dev fallback if not set)
- `COINGECKO_API_KEY` - CoinGecko API key for live cryptocurrency price feeds (used by mixer cross-asset swap rates)
- `SERPAPI_KEY` - SerpAPI key for VPN private search feature (server-side proxied Google search)
- `HELIUS_API_KEY` - Helius API key for Solana RPC (used by sweep-wallet utility script)

## Database Tables

- `users` - User accounts (email, password_hash, name)
- `mix_operations` - Cross-asset swap operations (send_coin, receive_coin, send_amount, receive_amount, exchange_rate, fee_percent, recipient_address, privacy_level, delay_minutes, status, deposit_address, deposit_private_key_enc, tx_hash)
- `conversations` - Messenger conversations per user (contact_user_id FK to users, last_message, last_message_at, UNIQUE per user+contact_user_id)
- `messages` - Messenger messages (conversation_id FK, user_id FK, content, sender, self_destruct_seconds)
- `bridge_transfers` - Cross-chain bridge transfers (source_chain, dest_chain, token, amount, recipient_address, status, deposit_address)
- `vpn_sessions` - VPN session records (server_id, server_name, server_country, server_city, assigned_ip, fingerprint_hash, relay_node, bytes_up, bytes_down, kill_switch, status, connected_at, disconnected_at)
- `vpn_searches` - VPN search history (session_id FK, query, results_count, url_opened)
- `vpn_dapp_sessions` - dApp session tracking (vpn_session_id FK, url, title, status, opened_at, closed_at)
- `railgun_operations` - Railgun privacy operations (operation_type shield/transfer/unshield, network, token, amount, source_address, recipient_address, railgun_contract, status, zk_proof_hash)
- `agents` - Agent configurations and balances
- `transactions` - General transaction records
- `policies` - Security policy configurations
- `api_keys` - User API keys
- `integrations` - Third-party integrations
