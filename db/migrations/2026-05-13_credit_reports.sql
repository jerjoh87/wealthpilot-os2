-- Store parsed credit report scans and optional account-level details.
create table if not exists public.credit_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credit_score integer not null default 0,
  report_date date,
  bureaus text[] not null default '{}',
  total_open_accounts integer not null default 0,
  total_closed_accounts integer not null default 0,
  total_debt numeric(14,2) not null default 0,
  revolving_utilization numeric(7,2) not null default 0,
  hard_inquiries integer not null default 0,
  collections integer not null default 0,
  charge_offs integer not null default 0,
  late_payments integer not null default 0,
  bankruptcies integer not null default 0,
  negative_items integer not null default 0,
  funding_readiness_score integer not null default 0,
  recommended_next_actions text[] not null default '{}',
  raw_text_excerpt text,
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_reports_user_created_at on public.credit_reports (user_id, created_at desc);

alter table public.credit_reports enable row level security;
do $$ begin
  create policy "owner" on public.credit_reports for all using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

create table if not exists public.credit_report_accounts (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.credit_reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_report_accounts_user_report on public.credit_report_accounts (user_id, report_id);

alter table public.credit_report_accounts enable row level security;
do $$ begin
  create policy "owner" on public.credit_report_accounts for all using (user_id = auth.uid());
exception when duplicate_object then null; end $$;
