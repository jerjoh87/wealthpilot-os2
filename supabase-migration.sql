-- WealthPilot OS — Initial Schema
-- Run in Supabase SQL editor

-- Users (mirrors auth.users)
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text not null,
  plan        text not null default 'free',
  created_at  timestamptz default now()
);

-- Accounts (Plaid-ready)
create table public.accounts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  plaid_item_id text,
  plaid_account_id text,
  name          text not null,
  type          text not null,   -- checking | savings | credit
  balance       numeric not null default 0,
  institution   text not null default '',
  last4         text not null default '',
  updated_at    timestamptz default now()
);

-- Budgets
create table public.budgets (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.users(id) on delete cascade,
  category  text not null,
  "limit"   numeric not null,
  month     int  not null check (month between 1 and 12),
  year      int  not null,
  unique (user_id, category, month, year)
);

-- Transactions (Plaid-ready)
create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  account_id  uuid references public.accounts(id) on delete set null,
  name        text not null,
  amount      numeric not null,
  category    text not null default 'Uncategorized',
  date        date not null,
  plaid_tx_id text unique
);

-- Bills
create table public.bills (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  name        text not null,
  amount      numeric not null,
  due_day     int not null check (due_day between 1 and 31),
  category    text not null default '',
  autopay     boolean not null default false,
  recurring   text not null default 'monthly',
  created_at  timestamptz default now()
);

-- Calendar Events
create table public.calendar_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  title       text not null,
  amount      numeric not null default 0,
  type        text not null,   -- bill|subscription|income|debt|transfer|savings|reminder
  due_date    date not null,
  status      text not null default 'upcoming',  -- upcoming|paid|overdue
  autopay     boolean not null default false,
  recurring   text not null default 'none',
  notes       text not null default '',
  created_at  timestamptz default now()
);

-- Credit Scores
create table public.credit_scores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  score       int not null check (score between 300 and 850),
  provider    text not null default 'manual',
  recorded_at timestamptz default now()
);

-- Portfolio (SnapTrade/Webull-ready)
create table public.portfolio (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  ticker      text not null,
  name        text not null default '',
  shares      numeric not null default 0,
  price       numeric not null default 0,
  value       numeric not null default 0,
  change_pct  numeric not null default 0,
  source      text not null default 'manual',
  updated_at  timestamptz default now(),
  unique (user_id, ticker)
);

-- AI Messages
create table public.ai_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  role        text not null check (role in ('user','assistant')),
  content     text not null,
  created_at  timestamptz default now()
);

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.users           enable row level security;
alter table public.accounts        enable row level security;
alter table public.budgets         enable row level security;
alter table public.transactions    enable row level security;
alter table public.bills           enable row level security;
alter table public.calendar_events enable row level security;
alter table public.credit_scores   enable row level security;
alter table public.portfolio       enable row level security;
alter table public.ai_messages     enable row level security;

-- Policy template (repeat for each table)
do $$ declare t text;
begin
  foreach t in array array['accounts','budgets','transactions','bills','calendar_events','credit_scores','portfolio','ai_messages']
  loop
    execute format('create policy "owner" on public.%I for all using (user_id = auth.uid())', t);
  end loop;
end $$;

create policy "users_own" on public.users for all using (id = auth.uid());

-- ── Auto-create user row on signup ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Plaid Items (Phase 5) ──────────────────────────────────────────────────
-- Stores one row per connected bank (access_token never leaves the server)
create table public.plaid_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  item_id        text not null unique,
  access_token   text not null,           -- store encrypted; never expose to client
  cursor         text,                    -- transactions/sync pagination cursor
  status         text not null default 'active',  -- active | requires_reauth | pending_expiration
  needs_sync     boolean not null default false,
  last_synced_at timestamptz,
  created_at     timestamptz default now()
);

alter table public.plaid_items enable row level security;
create policy "owner" on public.plaid_items for all using (user_id = auth.uid());

-- accounts: add unique constraint for plaid upsert (user_id + plaid_item_id)
alter table public.accounts add constraint accounts_user_plaid_account_unique unique (user_id, plaid_account_id);

-- TODO(PROD): plaid_items.access_token is plaintext text currently. Encrypt at rest before production using PLAID_TOKEN_ENCRYPTION_KEY + KMS/Vault.
-- Recommended: encrypt access_token column using pgcrypto or Vault
-- alter table public.plaid_items alter column access_token set data type bytea
--   using pgp_sym_encrypt(access_token, current_setting('app.encryption_key'))::bytea;

