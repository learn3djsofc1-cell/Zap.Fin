# Zap.Fin

A crypto finance landing page built with React, Vite, TypeScript, and Tailwind CSS. It showcases a fictional DeFi product (Zap.Fin) with a modern, responsive UI including hero section, card management mockups, top-up flows, and card controls.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite)
- **Animations**: Framer Motion (scroll-triggered section transitions, staggered card reveals, hero entrance animations)
- **3D**: React Three Fiber + Three.js
- **Icons**: Lucide React
- **AI**: @google/genai (Gemini API key via GEMINI_API_KEY env var)

## Project Structure

```
/
├── index.html          # HTML entry point
├── src/
│   ├── main.tsx        # React entry point
│   ├── App.tsx         # Main app component (all sections)
│   └── index.css       # Global styles
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript config
└── package.json        # Dependencies and scripts
```

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

## Social Links

- Twitter/X: https://x.com/ZapFinBank
- LinkedIn: https://linkedin.com/company/zapfin

## Environment Variables

- `GEMINI_API_KEY` — Required for Gemini AI API calls (optional feature)
- `APP_URL` — The URL where the app is hosted
