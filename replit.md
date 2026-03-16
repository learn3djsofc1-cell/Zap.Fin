# Molt.Fin

AI-agent banking infrastructure platform built with React, Vite, TypeScript, and Tailwind CSS. Marketing landing page, documentation, and a full dashboard for managing AI agents.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router DOM v7 (client-side SPA routing)
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite)
- **Animations**: Framer Motion (scroll-triggered section transitions, staggered card reveals, hero entrance animations, parallax code mockup)
- **Icons**: Lucide React
- **Font**: Outfit (Google Fonts) set as --font-sans in index.css
- **Backend**: Express 4 with TypeScript (run via tsx) for health endpoint + static serve only

## Brand

- **Name**: Molt.Fin
- **Domain**: https://moltfin.app
- **Main Accent**: #FF6940
- **Background**: #08090C (hero/features), #0D0E12 (cards/sections)
- **Font**: Outfit (Google Fonts)
- **Logo**: public/moltfin-logo.png (lobster mascot)
- **Social**: X/Twitter at https://x.com/MoltFinApp

## Project Structure

```
/
├── index.html              # HTML entry point with SEO meta, OG/Twitter cards, structured data
├── src/
│   ├── main.tsx            # React entry with BrowserRouter, Routes (/, /docs, /app/*)
│   ├── App.tsx             # Landing page: Navbar, Hero (parallax code mockup), Features (6 cards), Protocol (settlement flow), Developers (metrics + quickstart), Security (4 cards), CTA, Footer
│   ├── index.css           # Global styles, animations, scrollbar
│   ├── docs/
│   │   └── DocsPage.tsx    # /docs - Full platform documentation
│   └── dashboard/
│       ├── DashboardLayout.tsx  # Sidebar + bottom nav layout with Outlet
│       ├── OverviewPage.tsx     # /app - Agent stats + recent activity table
│       ├── AgentsPage.tsx       # /app/agents - Agent cards with status, balance, tx count
│       ├── TransactionsPage.tsx # /app/transactions - Searchable/filterable tx table
│       └── PoliciesPage.tsx     # /app/policies - Policy cards with rules and agent assignments
├── public/
│   ├── moltfin-logo.png    # Lobster mascot logo
│   ├── solana-logo.png     # Partner logo
│   ├── usdc-logo-new.png   # Partner logo
│   ├── mastercard-logo.png # Partner logo
│   └── aws-logo.png        # Partner logo
├── server/
│   ├── index.ts            # Express server: /api/health + static dist serve
│   └── tsconfig.json       # Server TS config
├── vite.config.ts          # Vite config with /api proxy to Express
├── tsconfig.json           # Frontend TS config
└── package.json            # Dependencies and scripts
```

## Routes

- `/` Landing page (marketing site)
- `/docs` Platform documentation
- `/app` Dashboard overview
- `/app/agents` Agent management
- `/app/transactions` Transaction history
- `/app/policies` Policy management

## API Endpoints

- `GET /api/health` Health check

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
- **Hero parallax**: `useScroll` + `useTransform` for code mockup vertical offset

## Environment Variables

No secrets required. The app is a static marketing site with mock dashboard data, no database or external API dependencies.
