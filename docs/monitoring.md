# Monitoring Guide

## Health endpoint

Monitor the app using:

- `GET /api/health`

This endpoint always returns HTTP `200` while the app process is alive, and includes a JSON body with:

- `status`: `ok`, `degraded`, or `not_configured`
- `checks`: boolean configuration checks (no secret values)
- `warnings`: missing-key warnings

## Alert rules

Set alerts for:

1. Non-200 response from `/api/health`.
2. Request timeout / no response.
3. Response body `status === "not_configured"`.
4. Response time over 10 seconds.

Optional warning:

- Response body `status === "degraded"` (optional provider keys missing).

## Suggested monitoring stack

- **Render or Railway health checks**: platform-level availability checks on `/api/health`.
- **UptimeRobot**: external uptime + latency alerting.
- **Better Stack**: uptime checks and incident routing.
- **GitHub Actions**: CI build protection via `.github/workflows/build-check.yml`.
- **Sentry**: crash/exception tracking for frontend and API routes.

## Sentry note

Sentry is not currently installed in this repository. It can be added later for frontend/backend crash tracking once DSN and environment-level setup are ready.
