create table if not exists public.wallet_vaults (
  user_id uuid primary key references auth.users(id) on delete cascade,
  address text not null,
  encrypted text not null,
  updated_at timestamptz not null default now()
);

alter table public.wallet_vaults enable row level security;

drop policy if exists "wallet_vaults_select_own" on public.wallet_vaults;
drop policy if exists "wallet_vaults_insert_own" on public.wallet_vaults;
drop policy if exists "wallet_vaults_update_own" on public.wallet_vaults;

create policy "wallet_vaults_select_own" on public.wallet_vaults for select to authenticated using ((select auth.uid()) = user_id);
create policy "wallet_vaults_insert_own" on public.wallet_vaults for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "wallet_vaults_update_own" on public.wallet_vaults for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select, insert, update on public.wallet_vaults to authenticated;
