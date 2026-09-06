create table if not exists public.member_invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.member_invites enable row level security;

-- Seed codes are created only when an authenticated owner exists; otherwise the
-- first member can create one through the function after the migration runs.

drop policy if exists "member_invites_select_own" on public.member_invites;
create policy "member_invites_select_own"
  on public.member_invites for select
  to authenticated
  using ((select auth.uid()) = inviter_id);

drop policy if exists "member_invites_insert_own" on public.member_invites;
create policy "member_invites_insert_own"
  on public.member_invites for insert
  to authenticated
  with check ((select auth.uid()) = inviter_id);

grant select, insert on public.member_invites to authenticated;

create or replace function public.create_member_invite()
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  generated_code text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  generated_code := upper(substr(encode(gen_random_bytes(9), 'hex'), 1, 12));
  insert into public.member_invites (code, inviter_id)
  values (generated_code, auth.uid());
  return generated_code;
end;
$$;

grant execute on function public.create_member_invite() to authenticated;

create or replace function public.redeem_member_invite(invite_code text)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_count integer;
begin
  if auth.uid() is null then return false; end if;
  update public.member_invites
  set redeemed_by = auth.uid(), redeemed_at = now()
  where code = upper(trim(invite_code))
    and redeemed_by is null
    and inviter_id <> auth.uid();
  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

grant execute on function public.redeem_member_invite(text) to authenticated;

do $$
begin
  if exists (select 1 from auth.users limit 1) then
    insert into public.member_invites (code, inviter_id)
    select 'MEMBER-' || lpad(value::text, 3, '0'), u.id
    from generate_series(1, 50) as series(value)
    cross join lateral (select id from auth.users order by created_at asc limit 1) as u
    on conflict (code) do nothing;
  end if;
end;
$$;
