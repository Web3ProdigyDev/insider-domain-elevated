create table if not exists public.price_simulations (
  id uuid primary key default gen_random_uuid(),
  coin_id text not null,
  spike_percent numeric,
  range_min numeric,
  range_max numeric,
  capture_fraction numeric not null default 0.6,
  active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint price_simulations_range_check check (range_min is null or range_max is null or range_min <= range_max),
  constraint price_simulations_capture_check check (capture_fraction >= 0 and capture_fraction <= 1)
);

alter table public.price_simulations enable row level security;

create policy "Admins can read price simulations" on public.price_simulations
  for select to authenticated using ((select is_admin()));
create policy "Members can read active price simulations" on public.price_simulations
  for select to authenticated using (active = true);
create policy "Admins can create price simulations" on public.price_simulations
  for insert to authenticated with check ((select is_admin()) and created_by = (select auth.uid()));
create policy "Admins can update price simulations" on public.price_simulations
  for update to authenticated using ((select is_admin())) with check ((select is_admin()));

grant select on public.price_simulations to authenticated;
grant insert, update on public.price_simulations to authenticated;
create index if not exists price_simulations_active_coin_idx on public.price_simulations (coin_id) where active = true;
