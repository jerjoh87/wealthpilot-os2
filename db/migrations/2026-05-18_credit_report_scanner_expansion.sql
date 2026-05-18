alter table if exists public.credit_reports
  add column if not exists raw_ai_json jsonb,
  add column if not exists credit_card_debt numeric(14,2) not null default 0,
  add column if not exists total_credit_limit numeric(14,2) not null default 0,
  add column if not exists inquiry_count integer not null default 0,
  add column if not exists consumer_name text,
  add column if not exists source text,
  add column if not exists vantage_score integer;

alter table if exists public.credit_report_accounts
  add column if not exists account_type text,
  add column if not exists account_status text,
  add column if not exists bureau text,
  add column if not exists balance numeric(14,2) not null default 0,
  add column if not exists credit_limit numeric(14,2) not null default 0,
  add column if not exists monthly_payment numeric(14,2) not null default 0,
  add column if not exists date_opened date,
  add column if not exists last_reported date,
  add column if not exists payment_status text,
  add column if not exists is_negative boolean not null default false,
  add column if not exists dispute_reason text,
  add column if not exists confidence numeric(5,2);

create table if not exists public.credit_report_collections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.credit_reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  collector_name text,
  original_creditor text,
  balance numeric(14,2) not null default 0,
  status text,
  created_at timestamptz not null default now()
);
create index if not exists idx_credit_report_collections_user_report on public.credit_report_collections (user_id, report_id);
alter table public.credit_report_collections enable row level security;
do $$ begin create policy "owner" on public.credit_report_collections for all using (user_id = auth.uid()); exception when duplicate_object then null; end $$;

create table if not exists public.credit_report_inquiries (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.credit_reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  creditor_name text,
  inquiry_date date,
  bureau text,
  created_at timestamptz not null default now()
);
create index if not exists idx_credit_report_inquiries_user_report on public.credit_report_inquiries (user_id, report_id);
alter table public.credit_report_inquiries enable row level security;
do $$ begin create policy "owner" on public.credit_report_inquiries for all using (user_id = auth.uid()); exception when duplicate_object then null; end $$;
