# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server at http://localhost:3000
pnpm build      # Build production bundle
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

Use `pnpm` (not npm or yarn) — the project uses `pnpm-lock.yaml`.

## Architecture

**CotaAgrícola** is a real-time agricultural quotation display system for Brazilian rural producers. TVs in local businesses display live prices updated by farmers from their phones.

### Pages

- **`/` (TV Dashboard)** — `app/page.tsx`: Full-screen display optimized for **portrait-oriented TVs** (1080×1920). Shows 6 quotation cards per page in an auto-rotating vertical carousel (10s interval). Fetches from Supabase on load and subscribes to realtime updates. Includes an "AO VIVO" indicator and real-time clock.
- **`/agricultor`** — `app/agricultor/page.tsx`: Mobile-first producer interface with PIN-based login (name + 4-digit code). Lists all products from Supabase with current prices. Updates prices via the `atualizar_preco` RPC function. Also subscribes to realtime for live price sync.
- **`/api/noticias`** — `app/api/noticias/route.ts`: Cron-triggered API route that fetches headlines from 4 Brazilian agro RSS feeds (Canal Rural, Agrolink, Portal do Agronegócio, Brasil Agro), parses titles via regex, and syncs to the `noticias` table. Protected by `CRON_SECRET`. Runs every 30 min via Vercel Cron (`vercel.json`).

### Backend (Supabase)

- **`cotacoes`** table: produto, preco_atual, preco_anterior, variacao, produtor_id, produtor_nome, unidade, icone, ordem, ultima_atualizacao
- **`produtores`** table: nome, codigo (4-digit PIN), ativo
- **`noticias`** table: texto, ativa — auto-populated by RSS sync API
- **`atualizar_preco()`** RPC: Updates price, stores previous, calculates % variation automatically
- **Realtime** enabled on `cotacoes` and `noticias`
- **RLS** enabled with public read, update policies
- Setup SQL: `supabase-setup.sql`

### Key Components

- `components/price-card-landscape.tsx` — Quotation card optimized for portrait TVs. Compact layout: icon + product name | price | variation badge | producer name. Resolves Lucide icons via `icone` DB field with fallback by product name.
- `components/news-ticker.tsx` — Large horizontally scrolling news strip (text-xl, py-5) at the bottom of TV dashboard. Pulls from `noticias` table.
- `components/numeric-keypad.tsx` — Custom digit input (0–9, comma, delete, clear) for the agricultor price entry modal.
- `components/ui/` — shadcn/ui components. Add new ones via `pnpm dlx shadcn@latest add <component>`.

### Shared Code

- `lib/supabase.ts` — Supabase client singleton
- `lib/types.ts` — All types: Database (Supabase), Row types (snake_case), Frontend types (camelCase), mapper functions
- `lib/utils.ts` — Tailwind merge utility

### Tech Stack

- **Next.js 16** with App Router and React 19
- **Supabase** (PostgreSQL + Realtime + RPC)
- **Tailwind CSS v4** with OKLCH color space
- **shadcn/ui** (new-york style)
- **Vercel** for hosting + Cron Jobs
- Path alias `@/` maps to project root

### Styling

Dark glassmorphism theme over agricultural background image. Primary color: emerald green (`oklch(0.72 0.15 165)`). Tailwind v4 config in `app/globals.css` only (no tailwind.config.js).

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon (public) key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role (secret) — for news API only
CRON_SECRET=                     # Protects /api/noticias endpoint
```

### Setup

1. Create Supabase project
2. Run `supabase-setup.sql` in SQL Editor
3. Copy `.env.local.example` → `.env.local`, fill in keys
4. `pnpm install && pnpm dev`
5. Deploy: `vercel` (add env vars in Vercel dashboard)
