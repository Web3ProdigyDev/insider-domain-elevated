create table if not exists public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  role text not null default 'member' check (role in ('member','admin')),
  max_uses integer not null default 1 check (max_uses > 0),
  uses integer not null default 0 check (uses >= 0 and uses <= max_uses),
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.invite_codes enable row level security;

create or replace function public.redeem_invite_code(code text, user_id uuid)
returns boolean language plpgsql security definer stable set search_path = '' as $$
declare redeemed_role text;
begin
  update public.invite_codes set uses = uses + 1
  where public.invite_codes.code = upper(trim(redeem_invite_code.code))
    and uses < max_uses and (expires_at is null or expires_at > now())
  returning role into redeemed_role;
  if not found then return false; end if;
  update public.profiles set role = redeemed_role, updated_at = now()
  where id = redeem_invite_code.user_id;
  return found;
end;
$$;

revoke execute on function public.redeem_invite_code(text, uuid) from public;
grant execute on function public.redeem_invite_code(text, uuid) to authenticated;

drop policy if exists "admins_select_invite_codes" on public.invite_codes;
create policy "admins_select_invite_codes" on public.invite_codes for select to authenticated using (public.is_admin((select auth.uid())));
drop policy if exists "admins_insert_invite_codes" on public.invite_codes;
create policy "admins_insert_invite_codes" on public.invite_codes for insert to authenticated with check (public.is_admin((select auth.uid())) and created_by = (select auth.uid()));

insert into public.invite_codes (code, role, max_uses)
values ('FIRST-ADMIN-SETUP', 'admin', 1)
on conflict (code) do nothing;
