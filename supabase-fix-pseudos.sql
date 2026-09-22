alter table public.profiles
drop constraint if exists profiles_pseudo_key;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, pseudo)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'pseudo', ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do update
  set pseudo = excluded.pseudo;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

insert into public.profiles (id, pseudo)
select
  id,
  coalesce(nullif(raw_user_meta_data ->> 'pseudo', ''), split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;

alter table public.rooms enable row level security;
alter table public.room_players enable row level security;

drop policy if exists "rooms_select_authenticated" on public.rooms;
drop policy if exists "rooms_insert_host" on public.rooms;
drop policy if exists "rooms_update_host" on public.rooms;

create policy "rooms_select_authenticated"
on public.rooms
for select
to authenticated
using (true);

create policy "rooms_insert_host"
on public.rooms
for insert
to authenticated
with check ((select auth.uid()) = host_id);

create policy "rooms_update_host"
on public.rooms
for update
to authenticated
using ((select auth.uid()) = host_id)
with check ((select auth.uid()) = host_id);

drop policy if exists "room_players_select_authenticated" on public.room_players;
drop policy if exists "room_players_insert_self" on public.room_players;
drop policy if exists "room_players_update_self" on public.room_players;
drop policy if exists "room_players_delete_self" on public.room_players;

create policy "room_players_select_authenticated"
on public.room_players
for select
to authenticated
using (true);

create policy "room_players_insert_self"
on public.room_players
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.rooms
    where rooms.id = room_players.room_id
    and rooms.status = 'lobby'
  )
);

create policy "room_players_update_self"
on public.room_players
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "room_players_delete_self"
on public.room_players
for delete
to authenticated
using ((select auth.uid()) = user_id);
