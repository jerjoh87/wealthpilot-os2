# Environment Variables

## Core
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Plaid
- `PLAID_CLIENT_ID`
- `PLAID_SECRET`
- `PLAID_ENV` (defaults to `sandbox`)

## Integrations
- `SNAPTRADE_CLIENT_ID`
- `SNAPTRADE_CONSUMER_KEY`
- `SMARTCREDIT_API_KEY` or `SMARTCREDIT_CONNECT_URL`

## AI Coach
- `ANTHROPIC_API_KEY` (when missing, AI Coach falls back to offline mode)

## 2FA / Reminders
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (optional for email 2FA)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (optional for SMS reminders)

If optional variables are missing, the UI should continue to load and show fallback notices instead of crashing.
