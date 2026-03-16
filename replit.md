# Molt.Fin

AI-agent banking infrastructure platform built with React, Vite, TypeScript, and Tailwind CSS. Marketing landing page with documentation — no dashboard or authentication system.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router DOM v7 (client-side SPA routing)
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite)
- **Animations**: Framer Motion (scroll-triggered section transitions, staggered card reveals, hero entrance animations, parallax code mockup)
- **Icons**: Lucide React
- **Font**: Outfit (Google Fonts) — set as --font-sans in index.css
- **Backend**: Express 4 with TypeScript (run via tsx) — health endpoint + static serve only

## Brand

- **Name**: Molt.Fin
- **Main Accent**: #FF6940
- **Background**: #08090C (hero/features), #0D0E12 (cards/sections)
- **Font**: Outfit (Google Fonts)
- **Token**: $MOLTFIN (CA: 2vetyaB6FTKnWnRPwnq7iG8R3bgQW6TxAAik5nyXpump)

## Project Structure

```
/
├── index.html              # HTML entry point with SEO meta, OG/Twitter cards, structured data
├── src/
│   ├── main.tsx            # React entry with BrowserRouter, Routes (/ and /docs only)
│   ├── App.tsx             # Landing page: Navbar, Hero (parallax code mockup + CA copy), Features (6 cards), Protocol (settlement flow), Developers (metrics + quickstart), Security (4 cards), CTA, Footer
│   ├── index.css           # Global styles, animations (float, slide-up, fade-scale, pulse-glow, shimmer, gradient-shift), scrollbar
│   └── docs/
│       └── DocsPage.tsx    # /docs — Full platform documentation (overview, getting started, agent accounts, settlement, policies, SDK reference, FAQ)
├── server/
│   ├── index.ts            # Express server: /api/health + static dist serve
│   ├── db.ts               # Empty (no database needed)
│   └── tsconfig.json       # Server TS config
├── vite.config.ts          # Vite config with /api proxy to Express
├── tsconfig.json           # Frontend TS config
└── package.json            # Dependencies and scripts
```

## Routes

- `/` — Landing page (marketing site)
- `/docs` — Platform documentation

## API Endpoints

- `GET /api/health` — Health check

## Development

- **Dev server**: `npm run dev` → starts Express on port 3001 + Vite on port 5000
- **Vite proxies** `/api/*` requests to Express backend
- **Build**: `npm run build` → outputs to `dist/`
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

No secrets required. The app is a static marketing site with no database or external API dependencies.
