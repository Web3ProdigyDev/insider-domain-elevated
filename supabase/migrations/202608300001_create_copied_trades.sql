create table if not exists public.copied_trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  trade_code text not null,
  amount numeric not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.copied_trades enable row level security;

 do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'copied_trades'
      and policyname = 'copied_trades_select_own'
  ) then
    create policy "copied_trades_select_own"
      on public.copied_trades
      for select
      to authenticated
      using (user_id = (select auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'copied_trades'
      and policyname = 'copied_trades_insert_own'
  ) then
    create policy "copied_trades_insert_own"
      on public.copied_trades
      for insert
      to authenticated
      with check (user_id = (select auth.uid()));
  end if;
end
$$;
