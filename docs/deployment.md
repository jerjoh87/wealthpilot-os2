# Deployment Guide (Private Beta)

## Recommended host
Use **Vercel** for this Next.js app.

## 1) Connect the GitHub repository
1. Sign in to Vercel.
2. Click **Add New Project**.
3. Import this GitHub repository.
4. Keep framework preset as **Next.js**.
5. Keep build command as `npm run build` and output as default Next.js.

## 2) Add environment variables
In Vercel project settings, add all variables from `.env.example`.

Minimum required for core app:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Optional for beta depending on enabled integrations:
- AI provider keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`)
- Plaid/Teller keys

## 3) Run Supabase migration
Apply required SQL migrations in your Supabase project before beta launch.

Suggested process:
1. Open Supabase SQL Editor (or your migration tool).
2. Run the project migration SQL in order.
3. Verify tables used by auth, manual accounts, bills, budgets, transactions, and AI logs exist.

## 4) Validate health endpoint
After deploy, test:
- `GET /api/health`

Expect JSON with:
- `status`
- `timestamp`
- `environment`
- `checks`
- `warnings`

## 5) Verify AI provider status
From `/api/health`, confirm AI checks show expected configured/unconfigured booleans.

For private beta safety:
- AI can be unconfigured if product behavior is friendly (unavailable/fallback state).

## 6) Functional smoke tests
Run these manual checks on the deployed URL:
1. Signup works.
2. Login works.
3. Dashboard loads.
4. Manual account create/list works.
5. Bill create/list works.
6. Budget category create/list works.
7. Transaction create/list works.

## 7) Features that can be disabled for beta
If needed, disable or leave unconfigured:
- Plaid
- Teller
- SmartCredit
- Webull
- SnapTrade
- Stripe

## 8) CI build guard
GitHub Actions includes build guard workflow at:
- `.github/workflows/build-check.yml`

It runs `npm run build` on pull requests and pushes to `main`.
