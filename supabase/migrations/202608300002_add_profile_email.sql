alter table public.profiles
  add column if not exists email text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, first_name, username)
  values (
    new.id,
    new.email,
    nullif(trim(split_part(coalesce(new.raw_user_meta_data ->> 'full_name', ''), ' ', 1)), ''),
    nullif(split_part(new.email, '@', 1), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

update public.profiles
set email = auth.users.email
from auth.users
where public.profiles.id = auth.users.id
  and public.profiles.email is null;
