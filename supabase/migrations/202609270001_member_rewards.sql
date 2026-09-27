create table if not exists public.member_price_spikes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coin_id text not null,
  spike_percent numeric not null check (spike_percent > 0 and spike_percent <= 100000),
  active boolean not null default true,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists member_price_spikes_user_idx on public.member_price_spikes(user_id, active, created_at desc);
alter table public.member_price_spikes enable row level security;
drop policy if exists member_price_spikes_admin_all on public.member_price_spikes;
create policy member_price_spikes_admin_all on public.member_price_spikes for all to authenticated
using (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'))
with check (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'));

drop policy if exists notifications_admin_insert on public.notifications;
create policy notifications_admin_insert on public.notifications for insert to authenticated
with check (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'));

grant select, insert, update on public.member_price_spikes to authenticated;
grant insert on public.notifications to authenticated;
