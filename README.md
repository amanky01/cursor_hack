# Mann Mitra (SIH 2025)

Next.js (App Router) frontend with a **Convex** backend. HTTP APIs stay at `/api/*` (JWT + bcrypt), proxied from Next to your Convex deployment.

## Quick start

```bash
npm install
cp .env.example .env.local
# Set CONVEX_SITE_URL in .env.local (see Convex dashboard → HTTP URL, ends with .convex.site)
npx convex dev   # in one terminal: set JWT_SECRET etc. in Convex dashboard
npm run dev      # http://localhost:3000
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Convex env vars, admin seeding, and Mongo migration notes.

## Layout

- `src/app/` — routes (App Router)
- `src/components/`, `src/context/`, `src/services/` — UI and axios clients
- `convex/` — schema, HTTP router (`http.ts`), JWT node actions, sticky notes, chatbot proxy
