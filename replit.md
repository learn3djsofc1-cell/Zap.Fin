# Zap.Fin

A crypto finance web dApp built with React, Vite, TypeScript, and Tailwind CSS. Features a marketing landing page and a full dashboard application for managing crypto cards, top-ups, and card controls.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router DOM v7 (client-side SPA routing)
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite)
- **Animations**: Framer Motion (scroll-triggered section transitions, staggered card reveals, hero entrance animations)
- **3D**: React Three Fiber + Three.js
- **Icons**: Lucide React
- **AI**: @google/genai (Gemini API key via GEMINI_API_KEY env var)

## Project Structure

```
/
├── index.html              # HTML entry point with full SEO meta tags
├── src/
│   ├── main.tsx            # React entry point with BrowserRouter + Routes
│   ├── App.tsx             # Landing page (all marketing sections)
│   ├── index.css           # Global styles
│   └── dashboard/
│       ├── DashboardLayout.tsx  # Shared layout: sidebar, topbar, bottom nav
│       ├── OverviewPage.tsx     # /app — Balance, card preview, recent activity
│       ├── CardsPage.tsx        # /app/cards — Card management, settings, toggles
│       ├── TopupsPage.tsx       # /app/topups — Asset selector, amount, summary
│       └── ControlsPage.tsx     # /app/controls — Security toggles, limits, feed
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies and scripts
```

## Routes

- `/` — Landing page (marketing site)
- `/app` — Dashboard Overview (balance, card, activity)
- `/app/cards` — My Cards (card carousel, settings, details)
- `/app/topups` — Top-up Balance (asset select, amount, summary)
- `/app/controls` — Card Controls (security, limits, transactions)

All navigation between landing page and dashboard uses React Router `<Link>` for instant SPA transitions (no page reload).

## Development

- **Dev server**: `npm run dev` → runs on port 5000 (0.0.0.0)
- **Build**: `npm run build` → outputs to `dist/`
- **Lint**: `npm run lint`

## Deployment

Configured as a **static** site deployment:
- Build command: `npm run build`
- Public directory: `dist`

## Brand Assets (public/)

- `logo.png` — Zap.Fin logo (favicon + navbar + inline)
- `netflix.png`, `usdc.png`, `usdt.png` — Brand logos used in dashboard mockups
- `spotify.png`, `airbnb.png`, `apple.png`, `telegram.jpg` — Brand logos used in Rewards & Referrals card

## Social Links

- Twitter/X: https://x.com/ZapFinBank

## Environment Variables

- `GEMINI_API_KEY` — Required for Gemini AI API calls (optional feature)
- `APP_URL` — The URL where the app is hosted
