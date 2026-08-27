create table if not exists public.transactions (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('buy','sell','deposit','withdrawal','transfer')),
  asset_id text not null,
  amount numeric not null,
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions for insert to authenticated with check (user_id = (select auth.uid()));

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = uid and role = 'admin');
$$;

revoke execute on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

drop policy if exists "admins_select_profiles" on public.profiles;
create policy "admins_select_profiles" on public.profiles for select to authenticated using (public.is_admin((select auth.uid())));

drop policy if exists "admins_select_wallet_balances" on public.wallet_balances;
create policy "admins_select_wallet_balances" on public.wallet_balances for select to authenticated using (public.is_admin((select auth.uid())));

drop policy if exists "admins_select_transactions" on public.transactions;
create policy "admins_select_transactions" on public.transactions for select to authenticated using (public.is_admin((select auth.uid())));
