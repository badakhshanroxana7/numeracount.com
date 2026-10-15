-- Run once in the Supabase SQL editor. Promote trusted staff explicitly below.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('client', 'staff'))
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  box_folder_id text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.box_connection (
  id text primary key check (id = 'primary'),
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  root_folder_id text,
  updated_at timestamptz not null default now()
);

alter table public.box_connection add column if not exists root_folder_id text;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.box_connection enable row level security;
revoke all on public.profiles from anon, authenticated;
revoke all on public.clients from anon, authenticated;
revoke all on public.box_connection from anon, authenticated;

create or replace function public.create_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, role) values (new.id, 'client');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.create_profile();

-- Replace the address before running this statement for each trusted staff member:
-- update public.profiles set role = 'staff'
-- where id = (select id from auth.users where lower(email) = lower('staff@example.com'));
