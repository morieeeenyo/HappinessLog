create extension if not exists pgcrypto;



create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.happy_logs (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz not null,
  category text not null check (category in ('gratitude', 'kindness', 'teamwork', 'celebration', 'support')),
  note text,
  points integer not null check (points > 0),
  created_at timestamptz not null default now()
);

create index if not exists happy_logs_couple_occurred_idx on public.happy_logs(couple_id, occurred_at desc);

create table if not exists public.monthly_goals (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  month_start date not null,
  target_points integer not null check (target_points > 0),
  created_by uuid not null references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now(),
  unique (couple_id, month_start)
);

create or replace function public.current_couple_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id from public.profiles where user_id = auth.uid()
$$;

create or replace function public.set_tenant_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_couple_id uuid;
begin
  select couple_id into v_couple_id from public.profiles where user_id = auth.uid();

  if v_couple_id is null then
    raise exception 'Profile/couple is not set for current user';
  end if;

  new.couple_id := v_couple_id;

  if tg_table_name = 'happy_logs' then
    new.user_id := auth.uid();
  elsif tg_table_name = 'monthly_goals' then
    new.created_by := auth.uid();
  end if;

  return new;
end;
$$;

create trigger trg_happy_logs_set_tenant
before insert on public.happy_logs
for each row execute function public.set_tenant_fields();

create trigger trg_monthly_goals_set_tenant
before insert on public.monthly_goals
for each row execute function public.set_tenant_fields();

alter table public.profiles enable row level security;
alter table public.happy_logs enable row level security;
alter table public.monthly_goals enable row level security;

create policy profiles_select_own on public.profiles
for select using (user_id = auth.uid());

create policy profiles_insert_own on public.profiles
for insert with check (user_id = auth.uid());

create policy profiles_update_own on public.profiles
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy happy_logs_select_tenant on public.happy_logs
for select using (couple_id = public.current_couple_id());

create policy happy_logs_insert_tenant on public.happy_logs
for insert with check (couple_id = public.current_couple_id() and user_id = auth.uid());

create policy happy_logs_update_tenant on public.happy_logs
for update using (couple_id = public.current_couple_id()) with check (couple_id = public.current_couple_id());

create policy happy_logs_delete_tenant on public.happy_logs
for delete using (couple_id = public.current_couple_id());

create policy monthly_goals_select_tenant on public.monthly_goals
for select using (couple_id = public.current_couple_id());

create policy monthly_goals_insert_tenant on public.monthly_goals
for insert with check (couple_id = public.current_couple_id() and created_by = auth.uid());

create policy monthly_goals_update_tenant on public.monthly_goals
for update using (couple_id = public.current_couple_id()) with check (couple_id = public.current_couple_id());

create policy monthly_goals_delete_tenant on public.monthly_goals
for delete using (couple_id = public.current_couple_id());
