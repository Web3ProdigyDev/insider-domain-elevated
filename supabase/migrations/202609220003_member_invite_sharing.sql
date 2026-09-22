alter table if exists public.member_invites
  add column if not exists share_count integer not null default 0,
  add column if not exists last_shared_at timestamptz;

create or replace function public.record_member_invite_share(invite_code text)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.member_invites
  set share_count = share_count + 1, last_shared_at = now()
  where code = upper(trim(invite_code))
    and inviter_id = auth.uid()
    and redeemed_by is null;
  return found;
end;
$$;

grant execute on function public.record_member_invite_share(text) to authenticated;

alter table if exists public.notifications
  add column if not exists message text;

update public.notifications
set message = coalesce(message, body)
where message is null;

comment on column public.notifications.message is 'Legacy-compatible notification message; body remains the app display field.';
