# Feature Launch Audit — Requested Scope

**Date:** 2026-05-13 (UTC)
**Method:** code-path inspection + production build/type checks

## Checks executed

- `npm run -s type-check` ✅
- `npm run -s build` ✅
- Targeted source inspection for each requested feature area

## Launch readiness matrix

| Feature | Status | Readiness | Evidence |
|---|---|---|---|
| Free/Pro/Premium pricing | Implemented (marketing/front-end) | **Needs wiring** | Pricing tiers are rendered on homepage, but no entitlement enforcement found at API layer. |
| Signup/login | Implemented | **Ready with caveat** | Dedicated auth endpoints for signup/login/logout and 2FA routes are present. |
| Dashboard | Implemented | **Ready** | `/dashboard` route exists and loads the main app shell. |
| Budget | Implemented | **Ready** | CRUD APIs exist for budgets. |
| Bills | Implemented | **Ready** | CRUD APIs exist for bills. |
| Manual income | Implemented | **Ready with caveat** | UI logic supports manual income records; dedicated standalone income API not present (income handled in app data model/transactions context). |
| Manual accounts | Implemented | **Ready** | Accounts API supports create/list and account update paths independent of Plaid. |
| Plaid bank sync | Implemented | **Ready with caveat** | Link-token/exchange/sync/webhook endpoints exist; launch docs flag encryption/runbook completion as open work. |
| Goals | Implemented (UI/AI context) | **Needs validation** | Goals are used by AI/context logic, but no dedicated goals API endpoints found in current routes. |
| Credit score manual tracker | Implemented | **Ready** | Manual credit-score endpoint exists plus migration for manual tracking. |
| Credit utilization tracker | Implemented | **Ready with caveat** | Utilization logic is consumed in AI money-move/coaching logic; confirm UX surface and persistence in QA. |
| Debt payoff planner | Implemented | **Ready** | Debt CRUD endpoints exist and are used in coaching context. |
| Net worth tracker | Implemented | **Ready** | Net-worth signals are computed/used in AI and dashboard financial summary logic. |
| AI Coach | Implemented | **Ready with caveat** | AI chat endpoint exists with fallback behavior; depends on runtime AI key for full production behavior. |
| Today’s Money Move | Implemented | **Ready** | Rule-based daily recommendation generator exists in dashboard app logic. |
| SMS reminders | Implemented | **Ready with caveat** | Reminder preference/send/test endpoints + reminder library exist; requires SMS provider/env configuration in deployment. |
| Weekly report | Partially implemented | **Not launch-ready** | Monthly/budget summary reminder path exists; explicit weekly report scheduler/endpoint contract is not clearly present. |
| Stripe payment | Stubbed | **Not launch-ready** | Checkout endpoint explicitly says Stripe checkout is intentionally blocked until billing backend is finalized. |
| Mobile-friendly design | Implemented | **Ready** | Marketing page includes responsive layout and explicit mobile support messaging; design spec includes mobile dashboard blocks. |

## Overall launch assessment

- **Ready now (core):** signup/login, dashboard, budget, bills, manual accounts, debt tracker, net worth, core AI endpoint, money move, responsive UI.
- **Ready with deployment caveats:** Plaid sync, AI Coach, SMS reminders, credit utilization UX confirmation.
- **Not ready for public paid launch:** **Stripe payment** and **Weekly report** (as a distinct guaranteed feature) should be completed before promising them.
- **Commercialization gap:** Free/Pro/Premium are displayed, but server-side plan enforcement/billing entitlement checks should be validated before paid rollout.

## Recommended pre-launch closeout (priority)

1. Finish Stripe checkout + webhook + entitlement updates and verify plan gating.
2. Define/ship weekly report generation + delivery workflow (cron/job + template + user prefs).
3. Run end-to-end smoke test matrix for all “Ready with caveat” features in a staging environment with production-like env vars.
4. Confirm Plaid token security and env runbooks align with prior launch audit docs.
