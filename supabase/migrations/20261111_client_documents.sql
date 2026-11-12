-- Run after schema.sql, in Supabase SQL Editor. Safe to run again.
begin;

-- Preserve any previous Box folder reference for staff archive use.
alter table public.clients alter column box_folder_id drop not null;
alter table public.clients add column if not exists auth_user_id uuid references auth.users(id);
create unique index if not exists clients_auth_user_id_key on public.clients(auth_user_id);
update public.clients c set auth_user_id = u.id
from auth.users u where c.auth_user_id is null and lower(c.email) = lower(u.email);
insert into public.profiles(id, role) select id, 'client' from auth.users on conflict(id) do nothing;

insert into storage.buckets(id, name, public, file_size_limit)
values ('Client-Documents', 'Client-Documents', false, 10485760)
on conflict(id) do update set public = false, file_size_limit = 10485760;

-- These match the two policies entered in the dashboard. Recreate them by
-- their exact names so running this script doesn't duplicate those rules.
drop policy if exists "Clients read own documents" on storage.objects;
create policy "Clients read own documents" on storage.objects for select to authenticated
using (bucket_id = 'Client-Documents' and (storage.foldername(name))[1] = (select auth.uid()::text));
drop policy if exists "Clients upload own documents" on storage.objects;
create policy "Clients upload own documents" on storage.objects for insert to authenticated
with check (bucket_id = 'Client-Documents' and (storage.foldername(name))[1] = (select auth.uid()::text));

-- Restrictive guards prevent an unrelated broad storage policy from granting
-- cross-client read/write or update/delete access to this bucket.
drop policy if exists numeracount_read_guard on storage.objects;
create policy numeracount_read_guard on storage.objects as restrictive for select to public
using (bucket_id <> 'Client-Documents' or (storage.foldername(name))[1] = (select auth.uid()::text));
drop policy if exists numeracount_insert_guard on storage.objects;
create policy numeracount_insert_guard on storage.objects as restrictive for insert to public
with check (bucket_id <> 'Client-Documents' or (storage.foldername(name))[1] = (select auth.uid()::text));
drop policy if exists numeracount_update_guard on storage.objects;
create policy numeracount_update_guard on storage.objects as restrictive for update to public
using (bucket_id <> 'Client-Documents') with check (bucket_id <> 'Client-Documents');
drop policy if exists numeracount_delete_guard on storage.objects;
create policy numeracount_delete_guard on storage.objects as restrictive for delete to public
using (bucket_id <> 'Client-Documents');
commit;

-- Existing client rows without a matching account remain inaccessible.
-- Invite these users through Supabase Auth, then run this migration again.
select id, name, email from public.clients where auth_user_id is null;
