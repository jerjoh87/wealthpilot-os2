# Agents for Private Beta

This document lists lightweight operational agents that improve safety, observability, and reliability without changing product UI.

## Active now

### Health Monitor Agent (Active)
- Uses `GET /api/health` to report app status, environment, timestamp, and dependency checks.
- Confirms Supabase baseline and optional integrations (AI providers, Plaid, Teller) are configured.

### Build Guard Agent (Active)
- Enforced with GitHub Actions build check workflow.
- Runs `npm run build` on push/PR to prevent broken deployments.

### AI Cost Guard Agent (Active)
- Applies server-side limits for AI requests:
  - PDF upload size cap (default 10MB)
  - Extracted credit report text cap (default 60,000 chars)
  - AI chat message cap (default 4,000 chars)
- Returns friendly validation errors before expensive AI calls.

## Future agents

### Error Logger Agent (Future)
- Centralized structured API error logging with request correlation IDs.
- Planned for production triage and incident analysis.

### Performance Audit Agent (Future)
- Scheduled audits for API latency and bundle regressions.
- Planned for post-beta optimization cycles.

### Data Cleanup Agent (Future)
- Periodic cleanup/archival for transient scan artifacts and stale operational logs.
- Planned for long-term maintenance and storage hygiene.
