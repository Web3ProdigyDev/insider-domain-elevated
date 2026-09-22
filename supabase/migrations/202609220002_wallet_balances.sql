create table if not exists public.wallet_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  asset_id text not null,
  amount numeric not null default 0 check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, asset_id)
);

alter table public.wallet_balances enable row level security;

drop policy if exists users_select_own_wallet_balances on public.wallet_balances;
create policy users_select_own_wallet_balances on public.wallet_balances
  for select to authenticated
  using ((select auth.uid()) = user_id or public.is_admin((select auth.uid())));

drop policy if exists admins_manage_wallet_balances on public.wallet_balances;
create policy admins_manage_wallet_balances on public.wallet_balances
  for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

grant select on public.wallet_balances to authenticated;
grant insert, update on public.wallet_balances to authenticated;

create index if not exists wallet_balances_user_id_idx on public.wallet_balances (user_id);
