# Sehat Sathi — deployment

## Stack

- **Next.js 15** (App Router) in `src/app`.
- **Convex** (`convex/`) — database, HTTP `/api/*`, **patient AI** (LangGraph ReAct agent; Gemini default, OpenAI optional) with **Exa + Apify** as agent tools. **No FastAPI** for core chat.
- **Clerk** — counsellor and admin routes (`/counsellor`, `/admin`). Set `publicMetadata.role` to `"admin"` for admins in the Clerk dashboard. Convex staff APIs use **Convex + Clerk**: add a Clerk JWT template named **`convex`** (audience `convex`) with claim `role` = `{{user.public_metadata.role}}`, and set **`CLERK_JWT_ISSUER_DOMAIN`** in Convex env to your Clerk **Frontend API** URL (same value as in `.env.example`).
- **JWT** (Convex `JWT_SECRET`) — optional legacy **student** login (`/login`, `/register`).

## Environment variables

### Next.js (`.env.local`)

| Variable | Purpose |
| -------- | ------- |
| `CONVEX_SITE_URL` | Deployment **HTTP** base (`https://….convex.site`) for `/api` rewrites |
| `NEXT_PUBLIC_CONVEX_URL` | Deployment **`.convex.cloud`** URL for Convex React (`useAction`, `useMutation`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk |
| `CLERK_SECRET_KEY` | Clerk |

### Convex dashboard (Settings → Environment variables)

| Variable | Purpose |
| -------- | ------- |
| `JWT_SECRET` | Student JWT auth (HTTP routes) — **required** for `/api/auth/login` and any route that calls `signJwt` |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk Frontend API URL — **required** for `ConvexProviderWithClerk` and `api.adminCounsellors.*` |
| `GEMINI_API_KEY` | Default LLM (Gemini) |
| `OPENAI_API_KEY` | Optional; used when `LLM_PROVIDER=openai` |
| `LLM_PROVIDER` | `gemini` (default) or `openai` |
| `GEMINI_MODEL` | Optional override (default `gemini-2.5-flash`) |
| `OPENAI_MODEL` | Optional override (default `gpt-4o`) |
| `EXA_API_KEY` | Optional; `exa_search` tool in LangGraph chat agent |
| `APIFY_TOKEN` | Optional; `apify_search` tool in LangGraph chat agent |
| `APIFY_GOOGLE_SEARCH_ACTOR_ID` | Optional; default `apify/google-search-scraper` |
| `CHAT_AGENT_MAX_ITERATIONS` | Optional; default `5`; caps agent tool loop via LangGraph `recursionLimit` |

Set `JWT_SECRET` from the repo (dev deployment):

```bash
npx convex env set JWT_SECRET "$(openssl rand -base64 32 | tr -d '\n')"
```

Putting `JWT_SECRET` only in Next’s `.env.local` does **not** work: Convex actions read **`process.env` on the Convex side**, which comes from the dashboard / `convex env set`, not from Next.

Remove reliance on **`CHATBOT_SERVICE_URL`** / **`CHATBOT_API_KEY`** for the main chat flow.

## Local development

1. `npm install` (use `npm install --legacy-peer-deps` if Clerk peer conflicts with your React version).
2. `npx convex dev` — links deployment and updates `.env.local` entries from Convex where applicable.
3. Set variables above in Convex dashboard and `.env.local`.
4. **Helplines seed (once):**  
   `npx convex run internal/helplines:seedHelplinesOnce '{}'`
5. **Demo users (JWT students / legacy):** see commands in `convex/seed.ts`.
6. `npm run dev` — app at `http://localhost:3000`. Anonymous chat: **`/saathi`** → **`/chat`**. Staff: **`/sign-in`** → **`/admin`** or **`/counsellor`**.

## Flows

- **Anonymous patient:** `localStorage.saathi_id` + Convex `patients` / `sessions` / `moodLogs`; chat via `useAction(api.patientChat.sendMessage)`.
- **Logged-in student (JWT):** floating chat uses `/api/user/chat/ai` with `anonymousId` = `jwt:<userId>` on the server; optional `sessionId` in body (stored in `localStorage.saathi_jwt_session_id`).
- **Staff:** Clerk; `CounsellorClerkGate` upserts `counsellors` by `clerkUserId` (mutation requires matching signed-in Clerk user). Admin counsellor CRUD uses **`api.adminCounsellors`** (Clerk JWT), not JWT `localStorage.token`.
- **Guest appointments:** Convex `guestAppointments` + Next `/api/appointments` via `ConvexHttpClient` (needs `NEXT_PUBLIC_CONVEX_URL`).

## Vercel

- Set the same Next.js env vars.
- Run `npx convex deploy` for production Convex; point `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_SITE_URL` at that deployment.
