# Mann Mitra (SIH 2025) — deployment

## Stack

- **Next.js 15** (App Router) in the repo root (`src/app`).
- **Convex** (`convex/`) exposes the same `/api/*` REST routes as the old Express server, with **JWT** auth (`JWT_SECRET` in Convex env) and optional **FastAPI** chatbot (`CHATBOT_SERVICE_URL`, `CHATBOT_API_KEY`).

## Local development

1. Install dependencies: `npm install`
2. Create a Convex project and link: `npx convex dev` (sets `CONVEX_DEPLOYMENT` in `.env.local`).
3. In the [Convex dashboard](https://dashboard.convex.dev), add environment variables:
   - `JWT_SECRET` — strong secret (min 8 characters), same role as the old `JWT_SECRET_KEY`.
   - `CHATBOT_SERVICE_URL` — optional, e.g. `http://localhost:8000`
   - `CHATBOT_API_KEY` — optional
4. Copy `.env.example` to `.env.local` and set `CONVEX_SITE_URL` to your deployment’s **HTTP** base URL (ends with `.convex.site`, from Convex dashboard → Deployment → HTTP actions).
5. Seed users (after functions are pushed). Pick one approach:
   - **All three roles at once (dev/demo):**  
     `npx convex run internal/seed:seedDemoUsers '{"password":"YourDevPassword"}'`  
     Creates `student@demo.local`, `counsellor@demo.local`, `admin@demo.local` (override with `studentEmail` / `counsellorEmail` / `adminEmail` in the JSON if needed). Re-running after successful inserts will return `exists` for emails already in the database.
   - **Admin only:**  
     `npx convex run internal/seed:seedAdmin '{"email":"admin@example.com","password":"YourSecurePassword","firstName":"Admin","lastName":"User"}'`
   - **Student only:**  
     `npx convex run internal/seed:seedStudent '{"email":"student@example.com","password":"...","firstName":"Ada","lastName":"Student","contactNo":9876543210,"university":"Demo University","program":"B.Tech","branch":"CSE","semester":"4"}'`
   - **Counsellor only:**  
     `npx convex run internal/seed:seedCounsellor '{"email":"counsellor@example.com","password":"...","firstName":"Dr.","lastName":"Counsellor","contactNo":9876543211,"qualifications":"M.Phil Psychology","specialization":["Stress","Academic"],"availability":["Mon 10-12","Wed 14-16"]}'`
6. Run Next.js: `npm run dev`  
   API calls go to `http://localhost:3000/api/...` and rewrite to Convex.

## MongoDB migration

There is no automatic import from the old Mongo database. Export users if needed and insert via Convex dashboard or a one-off script, or recreate accounts with register + seed admin.

## Removed

The legacy **Express + Mongo** app in `backend/` has been removed in favor of Convex.
