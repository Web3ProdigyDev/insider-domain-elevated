alter table public.profiles add column if not exists suspended boolean not null default false;

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_actions enable row level security;

drop policy if exists admins_select_admin_actions on public.admin_actions;
create policy admins_select_admin_actions on public.admin_actions for select to authenticated using (public.is_admin((select auth.uid())));
drop policy if exists admins_insert_admin_actions on public.admin_actions;
create policy admins_insert_admin_actions on public.admin_actions for insert to authenticated with check (public.is_admin((select auth.uid())) and admin_id = (select auth.uid()));

drop policy if exists admins_update_profiles on public.profiles;
create policy admins_update_profiles on public.profiles for update to authenticated using (public.is_admin((select auth.uid()))) with check (public.is_admin((select auth.uid())));
drop policy if exists admins_update_wallet_balances on public.wallet_balances;
create policy admins_update_wallet_balances on public.wallet_balances for update to authenticated using (public.is_admin((select auth.uid()))) with check (public.is_admin((select auth.uid())));
drop policy if exists admins_insert_wallet_balances on public.wallet_balances;
create policy admins_insert_wallet_balances on public.wallet_balances for insert to authenticated with check (public.is_admin((select auth.uid())));
drop policy if exists admins_insert_transactions on public.transactions;
create policy admins_insert_transactions on public.transactions for insert to authenticated with check (public.is_admin((select auth.uid())));
drop policy if exists admins_update_invite_codes on public.invite_codes;
create policy admins_update_invite_codes on public.invite_codes for update to authenticated using (public.is_admin((select auth.uid()))) with check (public.is_admin((select auth.uid())));

alter table public.transactions drop constraint if exists transactions_type_check;
alter table public.transactions add constraint transactions_type_check check (type in ('buy','sell','deposit','withdrawal','transfer','bot_profit','admin_adjustment'));

grant select, insert on public.admin_actions to authenticated;
grant update on public.profiles, public.wallet_balances, public.invite_codes to authenticated;
grant insert on public.wallet_balances, public.transactions to authenticated;
