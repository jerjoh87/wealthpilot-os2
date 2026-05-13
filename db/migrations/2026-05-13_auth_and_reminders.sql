-- Persist 2FA and reminder settings used by dashboard flows.
create table if not exists public.user_security_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  two_factor_enabled boolean not null default false,
  two_factor_method text not null default 'email',
  updated_at timestamptz not null default now()
);

alter table public.user_security_settings enable row level security;
do $$ begin
  create policy "owner" on public.user_security_settings for all using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

create table if not exists public.reminder_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sms_enabled boolean not null default false,
  in_app_enabled boolean not null default true,
  reminder_time text not null default '09:00',
  timezone text not null default 'UTC',
  phone_number text,
  categories text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.reminder_preferences enable row level security;
do $$ begin
  create policy "owner" on public.reminder_preferences for all using (user_id = auth.uid());
exception when duplicate_object then null; end $$;
