create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.messages enable row level security;
drop policy if exists "messages_participants_select" on public.messages;
create policy "messages_participants_select" on public.messages for select to authenticated using ((select auth.uid()) in (sender_id, recipient_id));
drop policy if exists "messages_sender_insert" on public.messages;
create policy "messages_sender_insert" on public.messages for insert to authenticated with check ((select auth.uid()) = sender_id);
drop policy if exists "messages_recipient_update" on public.messages;
create policy "messages_recipient_update" on public.messages for update to authenticated using ((select auth.uid()) = recipient_id) with check ((select auth.uid()) = recipient_id);
grant select, insert, update on public.messages to authenticated;

create index if not exists messages_participants_created_idx on public.messages (sender_id, recipient_id, created_at desc);
create index if not exists messages_recipient_created_idx on public.messages (recipient_id, created_at desc);
