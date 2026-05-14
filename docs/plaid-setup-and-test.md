# Plaid setup and end-to-end test checklist

If the app shows **"Plaid is not configured yet. You can still add a manual account below."**, the backend is missing one or more Plaid environment variables.

## 1) Required environment variables

Set these in your runtime environment (local `.env.local`, Vercel project env vars, Render/Fly secrets, etc):

- `PLAID_CLIENT_ID`
- `PLAID_SECRET`
- `PLAID_ENV` (use `sandbox` for testing)
- `PLAID_TOKEN_ENCRYPTION_KEY` (required for token encrypt/decrypt helpers)

You also need your Supabase/auth variables configured so authenticated API routes can run.

## 2) Quick API-level configuration check

After signing in, run:

```bash
curl -s -X POST http://localhost:3000/api/plaid/link-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_AUTH_TOKEN>" \
  -d '{}'
```

Expected results:

- **Configured**: response includes `"link_token"`.
- **Not configured**: response returns `"configured": false` and a `"missing"` list.

## 3) Sandbox account-link test (UI)

1. Open the app and click **Connect with Plaid**.
2. In Plaid Link, choose **Sandbox Institution** (for example, *First Platypus Bank*).
3. Use Plaid Sandbox credentials (for example `user_good` / `pass_good`).
4. Finish MFA if prompted.
5. Return to the app and click **Sync now**.

Expected result:

- Account cards appear under Plaid-connected accounts.
- Balances refresh.
- Transactions populate in the transactions view after sync.

## 4) Verify data landed in database (Supabase)

Run SQL checks:

```sql
-- Linked items
select item_id, status, updated_at
from public.plaid_items
order by updated_at desc
limit 5;

-- Accounts from Plaid
select id, name, institution, balance, plaid_account_id, updated_at
from public.accounts
where plaid_account_id is not null
order by updated_at desc
limit 20;

-- Synced transactions
select id, name, amount, date, plaid_tx_id
from public.transactions
where plaid_tx_id is not null
order by date desc
limit 50;
```

## 5) Common failures and fixes

- **"Plaid is not configured for this environment."**
  - One or more required Plaid env vars are missing in the server runtime.
- **Link opens but exchange/sync fails**
  - Verify `PLAID_SECRET` matches the same Plaid project/environment as `PLAID_CLIENT_ID`.
- **No transactions after linking**
  - Ensure `PLAID_ENV=sandbox` for sandbox credentials.
  - Click **Sync now** to force `/api/plaid/sync`.
- **401/403 errors from Plaid routes**
  - User is not authenticated or auth token is missing/expired.

## 6) Production go-live reminder

Before production, make sure:

- Plaid webhook URL is registered (`/api/plaid/webhook`).
- Encryption-at-rest policy for Plaid access tokens is validated in your deployment pipeline.
