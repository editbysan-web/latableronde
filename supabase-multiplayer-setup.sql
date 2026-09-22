create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null,
  created_at timestamp with time zone default now()
);

alter table public.profiles
add column if not exists coins integer not null default 0,
add column if not exists owned_weapon_skins text[] not null default '{}'::text[],
add column if not exists equipped_weapon_skin text,
add column if not exists owned_name_skins text[] not null default '{}'::text[],
add column if not exists equipped_name_skin text,
add column if not exists owned_death_skins text[] not null default '{}'::text[],
add column if not exists equipped_death_skin text,
add column if not exists last_lucky_wheel_spin_at timestamp with time zone,
add column if not exists lucky_wheel_bonus_spins integer not null default 0,
add column if not exists liars_xp integer not null default 0,
add column if not exists liars_level integer not null default 1,
add column if not exists total_coins_earned integer not null default 0,
add column if not exists current_win_streak integer not null default 0,
add column if not exists best_win_streak integer not null default 0;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  game text not null,
  host_id uuid references auth.users(id) on delete cascade,
  status text default 'lobby',
  created_at timestamp with time zone default now()
);

create table if not exists public.room_players (
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  pseudo text not null,
  ready boolean default false,
  score integer default 0,
  primary key (room_id, user_id)
);

alter table public.profiles
drop constraint if exists profiles_pseudo_key;

alter table public.rooms
add column if not exists settings jsonb not null default '{}'::jsonb;

alter table public.room_players
add column if not exists joined_at timestamp with time zone not null default now();

alter table public.room_players
add column if not exists weapon_skin text,
add column if not exists name_skin text,
add column if not exists death_skin text,
add column if not exists last_seen_at timestamp with time zone not null default now(),
add column if not exists presence_device text not null default 'desktop';

create table if not exists public.coin_rewards (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  game_id text not null,
  user_id uuid references auth.users(id) on delete cascade,
  reward_type text not null,
  reward_key text not null,
  amount integer not null,
  created_at timestamp with time zone default now(),
  unique (reward_key)
);

create table if not exists public.lucky_wheel_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  reward_id text not null,
  reward_label text not null,
  coins integer not null default 0,
  skin_id text,
  was_bonus boolean not null default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.liars_profile_stats (
  user_id uuid references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('global', 'normal', 'roulette', 'chaos', 'dead21', 'blackjack')),
  stats jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone not null default now(),
  primary key (user_id, mode)
);

create table if not exists public.liars_game_stat_claims (
  room_id uuid references public.rooms(id) on delete cascade,
  game_id text not null,
  created_at timestamp with time zone not null default now(),
  primary key (room_id, game_id)
);

create table if not exists public.liars_player_badges (
  user_id uuid references public.profiles(id) on delete cascade,
  badge_id text not null,
  category text not null check (category in ('roulette', 'chaos', 'blackjack')),
  state text not null default 'LOCKED' check (state in ('LOCKED', 'COMPLETED_UNCLAIMED', 'CLAIMED')),
  progress integer not null default 0,
  unlocked_at timestamp with time zone,
  claimed_at timestamp with time zone,
  updated_at timestamp with time zone not null default now(),
  primary key (user_id, badge_id)
);

create table if not exists public.liars_badge_category_rewards (
  user_id uuid references public.profiles(id) on delete cascade,
  category text not null check (category in ('roulette', 'chaos', 'blackjack')),
  coins integer not null,
  claimed_at timestamp with time zone not null default now(),
  primary key (user_id, category)
);

create table if not exists public.liars_badge_unlock_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete cascade,
  game_id text not null,
  badge_id text not null,
  created_at timestamp with time zone not null default now(),
  seen_at timestamp with time zone,
  unique (user_id, room_id, game_id, badge_id)
);

create table if not exists public.liars_afk_prompts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  pseudo text not null default 'Joueur',
  status text not null default 'active',
  next_check_at timestamp with time zone not null default now() + interval '30 seconds',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.liars_profile_stats
drop constraint if exists liars_profile_stats_mode_check;
alter table public.liars_profile_stats
add constraint liars_profile_stats_mode_check check (mode in ('global', 'normal', 'roulette', 'chaos', 'dead21', 'blackjack'));

alter table public.liars_player_badges
drop constraint if exists liars_player_badges_category_check;
alter table public.liars_player_badges
add constraint liars_player_badges_category_check check (category in ('roulette', 'chaos', 'blackjack'));

alter table public.liars_badge_category_rewards
drop constraint if exists liars_badge_category_rewards_category_check;
alter table public.liars_badge_category_rewards
add constraint liars_badge_category_rewards_category_check check (category in ('roulette', 'chaos', 'blackjack'));

create table if not exists public.blackjack_room_states (
  room_id uuid primary key references public.rooms(id) on delete cascade,
  phase text not null default 'betting',
  round_id text not null default '',
  dealer_hand jsonb not null default '[]'::jsonb,
  player_hands jsonb not null default '{}'::jsonb,
  bets jsonb not null default '{}'::jsonb,
  hand_bets jsonb not null default '{}'::jsonb,
  hand_flags jsonb not null default '{}'::jsonb,
  results jsonb not null default '{}'::jsonb,
  current_player uuid,
  active_hand integer not null default 0,
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.dead21_room_states (
  room_id uuid primary key references public.rooms(id) on delete cascade,
  deck jsonb not null default '[]'::jsonb,
  round integer not null default 1,
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.dead21_player_states (
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  hand jsonb not null default '[]'::jsonb,
  played jsonb not null default '[]'::jsonb,
  pending_draw jsonb,
  score integer not null default 0,
  turn_count integer not null default 0,
  stayed boolean not null default false,
  danger integer not null default 1,
  eliminated boolean not null default false,
  primary key (room_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.coin_rewards enable row level security;
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.lucky_wheel_history enable row level security;
alter table public.liars_profile_stats enable row level security;
alter table public.liars_game_stat_claims enable row level security;
alter table public.liars_player_badges enable row level security;
alter table public.liars_badge_category_rewards enable row level security;
alter table public.liars_badge_unlock_events enable row level security;
alter table public.liars_afk_prompts enable row level security;
alter table public.blackjack_room_states enable row level security;
alter table public.dead21_room_states enable row level security;
alter table public.dead21_player_states enable row level security;

alter table public.rooms replica identity full;
alter table public.room_players replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rooms'
    ) then
      alter publication supabase_realtime add table public.rooms;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'room_players'
    ) then
      alter publication supabase_realtime add table public.room_players;
    end if;
  end if;
end;
$$;

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
    coalesce(nullif(new.raw_user_meta_data ->> 'pseudo', ''), split_part(new.email, '@', 1), 'Joueur')
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
drop policy if exists "lucky_wheel_history_select_own" on public.lucky_wheel_history;
drop policy if exists "liars_player_badges_select_own" on public.liars_player_badges;
drop policy if exists "liars_badge_rewards_select_own" on public.liars_badge_category_rewards;
drop policy if exists "liars_badge_events_select_own" on public.liars_badge_unlock_events;

create policy "room_players_select_authenticated"
on public.room_players
for select
to authenticated
using (true);

create policy "room_players_insert_self"
on public.room_players
for insert
to authenticated
with check ((select auth.uid()) = user_id);

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

create policy "lucky_wheel_history_select_own"
on public.lucky_wheel_history
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "liars_player_badges_select_own"
on public.liars_player_badges
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "liars_badge_rewards_select_own"
on public.liars_badge_category_rewards
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "liars_badge_events_select_own"
on public.liars_badge_unlock_events
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "dead21_player_select_own" on public.dead21_player_states;

create policy "dead21_player_select_own"
on public.dead21_player_states
for select
to authenticated
using ((select auth.uid()) = user_id);

drop function if exists public.create_room_rpc(text, text, text);
drop function if exists public.create_room_rpc(text, text, text, jsonb);
drop function if exists public.join_room_rpc(uuid, text);
drop function if exists public.update_room_settings_rpc(uuid, jsonb);
drop function if exists public.update_liars_state_rpc(uuid, jsonb);
drop function if exists public.update_photo_state_rpc(uuid, jsonb);
drop function if exists public.update_who_state_rpc(uuid, jsonb);
drop function if exists public.update_who_vote_rpc(uuid, text);
drop function if exists public.update_true_state_rpc(uuid, jsonb);
drop function if exists public.submit_true_entries_rpc(uuid, text, text);
drop function if exists public.submit_true_vote_rpc(uuid, text, boolean);
drop function if exists public.start_room_rpc(uuid);
drop function if exists public.leave_room_rpc(uuid);
drop function if exists public.buy_shop_item_rpc(text, text);
drop function if exists public.equip_shop_item_rpc(text, text);
drop function if exists public.sell_shop_item_rpc(text, text);
drop function if exists public.get_dark_market_state_rpc();
drop function if exists public.get_lucky_wheel_state_rpc();
drop function if exists public.spin_lucky_wheel_rpc();
drop function if exists public.get_june_5_gift_state_rpc();
drop function if exists public.claim_june_5_gift_rpc();
drop function if exists public.award_liars_reward_rpc(uuid, text, text, text, uuid);
drop function if exists public.unlock_liars_badge_internal(uuid, uuid, text, text, text, integer);
drop function if exists public.claim_liars_badge_rpc(text);
drop function if exists public.claim_liars_badge_category_reward_rpc(text);
drop function if exists public.reset_liars_profile_stats_rpc();
drop function if exists public.liars_jsonb_add(jsonb, jsonb);
drop function if exists public.get_liars_profile_rpc(uuid);
drop function if exists public.finalize_liars_game_stats_rpc(uuid);
drop function if exists public.check_liars_inactivity_rpc(uuid, integer);
drop function if exists public.respond_liars_inactivity_rpc(uuid, uuid, uuid, text);
drop function if exists public.update_player_presence_rpc(uuid);
drop function if exists public.update_player_presence_rpc(uuid, text);
drop function if exists public.get_room_player_coins_rpc(uuid);
drop function if exists public.cleanup_stale_room_players_rpc(uuid, integer);
drop function if exists public.cleanup_stale_room_players_rpc(uuid, integer, boolean);
drop function if exists public.cleanup_old_rooms_rpc(integer, integer, integer);
drop function if exists public.start_blackjack_room_rpc(uuid);
drop function if exists public.blackjack_place_bet_rpc(uuid, integer);
drop function if exists public.blackjack_hit_rpc(uuid);
drop function if exists public.blackjack_stand_rpc(uuid);
drop function if exists public.blackjack_double_rpc(uuid);
drop function if exists public.blackjack_split_rpc(uuid);
drop function if exists public.blackjack_finalize_round_rpc(uuid);
drop function if exists public.get_blackjack_private_state_rpc(uuid);
drop function if exists public.blackjack_card_value(jsonb);
drop function if exists public.blackjack_hand_score(jsonb);
drop function if exists public.blackjack_hand_json(jsonb, text);
drop function if exists public.blackjack_sync_public_state(uuid);
drop function if exists public.blackjack_finish_round(uuid);
drop function if exists public.blackjack_advance_turn(uuid);
drop function if exists public.blackjack_random_card();
drop function if exists public.dead21_card_value(text);
drop function if exists public.dead21_card_label(text);
drop function if exists public.dead21_card_images(text);
drop function if exists public.dead21_make_card(text);
drop function if exists public.dead21_build_deck();
drop function if exists public.dead21_public_maps(uuid);
drop function if exists public.dead21_start_round_internal(uuid, jsonb);
drop function if exists public.dead21_award_state_reward(uuid, jsonb, text, uuid, text);
drop function if exists public.dead21_award_game_end_rewards(uuid, jsonb, text);
drop function if exists public.dead21_apply_shot(uuid, jsonb, uuid);
drop function if exists public.dead21_finish_round_internal(uuid, jsonb);
drop function if exists public.dead21_after_action_internal(uuid, jsonb);
drop function if exists public.start_dead21_room_rpc(uuid);
drop function if exists public.get_dead21_private_state_rpc(uuid);
drop function if exists public.dead21_play_card_rpc(uuid, text, integer);
drop function if exists public.dead21_draw_card_rpc(uuid);
drop function if exists public.dead21_play_draw_choice_rpc(uuid, text, text, integer);
drop function if exists public.dead21_stay_rpc(uuid);
drop function if exists public.dead21_accuse_rpc(uuid);
drop function if exists public.dead21_forfeit_player_rpc(uuid, uuid);
drop function if exists public.dead21_finalize_reveal_rpc(uuid, text);
drop function if exists public.dead21_finalize_deck_intro_rpc(uuid, text);

insert into storage.buckets (id, name, public)
values ('photo-roulette', 'photo-roulette', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "photo_roulette_read" on storage.objects;
drop policy if exists "photo_roulette_insert_own" on storage.objects;
drop policy if exists "photo_roulette_update_own" on storage.objects;
drop policy if exists "photo_roulette_delete_own" on storage.objects;

create policy "photo_roulette_read"
on storage.objects
for select
to authenticated
using (bucket_id = 'photo-roulette');

create policy "photo_roulette_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'photo-roulette'
  and split_part(name, '/', 2) = (select auth.uid())::text
);

create policy "photo_roulette_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'photo-roulette'
  and split_part(name, '/', 2) = (select auth.uid())::text
)
with check (
  bucket_id = 'photo-roulette'
  and split_part(name, '/', 2) = (select auth.uid())::text
);

create policy "photo_roulette_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'photo-roulette'
  and split_part(name, '/', 2) = (select auth.uid())::text
);

create function public.create_room_rpc(
  p_code text,
  p_game text,
  p_pseudo text,
  p_settings jsonb default '{}'::jsonb
)
returns table (
  id uuid,
  code text,
  game text,
  host_id uuid,
  status text,
  settings jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms;
  v_weapon_skin text;
  v_name_skin text;
  v_death_skin text;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  if p_game not in ('who', 'true', 'liars', 'photo', 'blackjack') then
    raise exception 'invalid_game';
  end if;

  insert into public.rooms (code, game, host_id, status, settings)
  values (upper(p_code), p_game, (select auth.uid()), 'lobby', coalesce(p_settings, '{}'::jsonb))
  returning * into v_room;

  select equipped_weapon_skin, equipped_name_skin, equipped_death_skin
  into v_weapon_skin, v_name_skin, v_death_skin
  from public.profiles
  where public.profiles.id = (select auth.uid());

  insert into public.room_players (room_id, user_id, pseudo, score, weapon_skin, name_skin, death_skin)
  values (v_room.id, (select auth.uid()), left(coalesce(nullif(p_pseudo, ''), 'Joueur'), 40), 0, v_weapon_skin, v_name_skin, v_death_skin)
  on conflict (room_id, user_id) do update
  set pseudo = excluded.pseudo,
      weapon_skin = excluded.weapon_skin,
      name_skin = excluded.name_skin,
      death_skin = excluded.death_skin;

  return query
  select v_room.id, v_room.code, v_room.game, v_room.host_id, v_room.status, v_room.settings;
end;
$$;

create function public.join_room_rpc(
  p_room_id uuid,
  p_pseudo text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms;
  v_weapon_skin text;
  v_name_skin text;
  v_death_skin text;
  v_player_count integer;
  v_already_joined boolean;
  v_liars_mode text;
  v_max_players integer;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  select *
  into v_room
  from public.rooms
  where rooms.id = p_room_id
  and rooms.status = 'lobby'
  for update;

  if v_room.id is null then
    raise exception 'room_not_available';
  end if;

  if v_room.game = 'blackjack' then
    v_max_players := 4;
  elsif v_room.game = 'liars' then
    v_liars_mode := coalesce(v_room.settings #>> '{liars,mode}', 'normal');
    v_max_players := case when v_liars_mode = 'chaos' then 6 else 4 end;
  else
    v_max_players := null;
  end if;

  if v_max_players is not null then
    select exists (
      select 1
      from public.room_players
      where room_players.room_id = p_room_id
      and room_players.user_id = (select auth.uid())
    )
    into v_already_joined;

    select count(*)
    into v_player_count
    from public.room_players
    where room_players.room_id = p_room_id;

    if not v_already_joined and v_player_count >= v_max_players then
      raise exception 'room_full';
    end if;
  end if;

  select equipped_weapon_skin, equipped_name_skin, equipped_death_skin
  into v_weapon_skin, v_name_skin, v_death_skin
  from public.profiles
  where public.profiles.id = (select auth.uid());

  insert into public.room_players (room_id, user_id, pseudo, score, weapon_skin, name_skin, death_skin)
  values (p_room_id, (select auth.uid()), left(coalesce(nullif(p_pseudo, ''), 'Joueur'), 40), 0, v_weapon_skin, v_name_skin, v_death_skin)
  on conflict (room_id, user_id) do update
  set pseudo = excluded.pseudo,
      weapon_skin = excluded.weapon_skin,
      name_skin = excluded.name_skin,
      death_skin = excluded.death_skin;
end;
$$;

create or replace function public.get_room_player_coins_rpc(
  p_room_id uuid
)
returns table(user_id uuid, coins integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.room_players
    where room_players.room_id = p_room_id
    and room_players.user_id = (select auth.uid())
  ) then
    raise exception 'not_room_player';
  end if;

  return query
  select rp.user_id, coalesce(p.coins, 0)::integer
  from public.room_players rp
  join public.profiles p on p.id = rp.user_id
  where rp.room_id = p_room_id
  order by rp.joined_at asc;
end;
$$;

create or replace function public.get_june_5_gift_state_rpc()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_now timestamp := (clock_timestamp() at time zone 'Europe/Paris');
  v_claimed boolean;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select exists (
    select 1
    from public.coin_rewards
    where user_id = v_uid
    and reward_type = 'june_5_gift'
    and reward_key = 'june_5_2026:' || v_uid::text
  )
  into v_claimed;

  return jsonb_build_object(
    'available', v_now::date = date '2026-06-05',
    'claimed', v_claimed,
    'coins', 1000,
    'serverDate', to_char(v_now, 'YYYY-MM-DD')
  );
end;
$$;

create or replace function public.claim_june_5_gift_rpc()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_now timestamp := (clock_timestamp() at time zone 'Europe/Paris');
  v_profile public.profiles;
  v_amount integer := 1000;
  v_reward_key text;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if v_now::date <> date '2026-06-05' then
    raise exception 'gift_not_available';
  end if;

  v_reward_key := 'june_5_2026:' || v_uid::text;

  insert into public.coin_rewards (room_id, game_id, user_id, reward_type, reward_key, amount)
  values (null, 'june_5_2026', v_uid, 'june_5_gift', v_reward_key, v_amount)
  on conflict (reward_key) do nothing;

  if not found then
    raise exception 'gift_already_claimed';
  end if;

  update public.profiles
  set coins = coalesce(coins, 0) + v_amount,
      total_coins_earned = coalesce(total_coins_earned, 0) + v_amount
  where id = v_uid
  returning * into v_profile;

  return jsonb_build_object(
    'profile', to_jsonb(v_profile),
    'coins', v_amount,
    'claimed', true
  );
end;
$$;

create function public.update_room_settings_rpc(
  p_room_id uuid,
  p_settings jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms;
  v_player_count integer;
  v_liars_mode text;
  v_max_players integer;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  select *
  into v_room
  from public.rooms
  where public.rooms.id = p_room_id
  and host_id = (select auth.uid())
  and public.rooms.status = 'lobby';

  if v_room.id is null then
    raise exception 'not_room_host';
  end if;

  if v_room.game = 'liars' then
    v_liars_mode := coalesce(p_settings #>> '{liars,mode}', 'normal');
    if v_liars_mode not in ('normal', 'roulette', 'chaos') then
      v_liars_mode := 'normal';
    end if;
    v_max_players := case when v_liars_mode = 'chaos' then 6 else 4 end;

    select count(*)
    into v_player_count
    from public.room_players
    where room_players.room_id = p_room_id;

    if v_player_count > v_max_players then
      raise exception 'liars_mode_too_many_players';
    end if;
  end if;

  update public.rooms
  set settings = coalesce(p_settings, '{}'::jsonb)
  where public.rooms.id = p_room_id
  and host_id = (select auth.uid())
  and public.rooms.status = 'lobby';

  if not found then
    raise exception 'not_room_host';
  end if;
end;
$$;

create function public.start_room_rpc(
  p_room_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  update public.rooms
  set status = 'playing'
  where public.rooms.id = p_room_id
  and host_id = (select auth.uid())
  and public.rooms.status = 'lobby';

  if not found then
    raise exception 'not_room_host';
  end if;
end;
$$;

create function public.update_liars_state_rpc(
  p_room_id uuid,
  p_state jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.room_players
    where room_id = p_room_id
    and user_id = (select auth.uid())
  ) then
    raise exception 'not_room_player';
  end if;

  update public.rooms
  set settings = jsonb_set(
    coalesce(settings, '{}'::jsonb),
    '{liars,state}',
    coalesce(p_state, '{}'::jsonb),
    true
  )
  where public.rooms.id = p_room_id
  and public.rooms.game = 'liars'
  and public.rooms.status = 'playing';

  if not found then
    raise exception 'room_not_playing';
  end if;
end;
$$;

create function public.update_photo_state_rpc(
  p_room_id uuid,
  p_state jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.room_players
    where room_id = p_room_id
    and user_id = (select auth.uid())
  ) then
    raise exception 'not_room_player';
  end if;

  update public.rooms
  set settings = jsonb_set(
    coalesce(settings, '{}'::jsonb),
    '{photo,state}',
    coalesce(p_state, '{}'::jsonb),
    true
  )
  where public.rooms.id = p_room_id
  and public.rooms.game = 'photo'
  and public.rooms.status = 'playing';

  if not found then
    raise exception 'room_not_playing';
  end if;
end;
$$;

create function public.update_who_state_rpc(
  p_room_id uuid,
  p_state jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.room_players
    where room_id = p_room_id
    and user_id = (select auth.uid())
  ) then
    raise exception 'not_room_player';
  end if;

  update public.rooms
  set settings = jsonb_set(
    coalesce(settings, '{}'::jsonb),
    '{who,state}',
    coalesce(p_state, '{}'::jsonb),
    true
  )
  where public.rooms.id = p_room_id
  and public.rooms.game = 'who'
  and public.rooms.status = 'playing';

  if not found then
    raise exception 'room_not_playing';
  end if;
end;
$$;

create function public.update_who_vote_rpc(
  p_room_id uuid,
  p_target_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
  v_user_id text;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  v_user_id := (select auth.uid())::text;

  if not exists (
    select 1
    from public.room_players
    where room_id = p_room_id
    and user_id = (select auth.uid())
  ) then
    raise exception 'not_room_player';
  end if;

  select settings -> 'who' -> 'state'
  into v_state
  from public.rooms
  where public.rooms.id = p_room_id
  and public.rooms.game = 'who'
  and public.rooms.status = 'playing'
  for update;

  if v_state is null then
    raise exception 'room_not_playing';
  end if;

  if coalesce(v_state ->> 'status', '') <> 'voting' then
    return;
  end if;

  if (v_state -> 'votes') ? v_user_id then
    return;
  end if;

  update public.rooms
  set settings = jsonb_set(
    coalesce(settings, '{}'::jsonb),
    '{who,state}',
    jsonb_set(
      jsonb_set(v_state, '{votes}', coalesce(v_state -> 'votes', '{}'::jsonb), true),
      array['votes', v_user_id],
      to_jsonb(p_target_id),
      true
    ),
    true
  )
  where public.rooms.id = p_room_id
  and public.rooms.game = 'who'
  and public.rooms.status = 'playing';
end;
$$;

create function public.update_true_state_rpc(
  p_room_id uuid,
  p_state jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.room_players
    where room_id = p_room_id
    and user_id = (select auth.uid())
  ) then
    raise exception 'not_room_player';
  end if;

  update public.rooms
  set settings = jsonb_set(
    coalesce(settings, '{}'::jsonb),
    '{true,state}',
    coalesce(p_state, '{}'::jsonb),
    true
  )
  where public.rooms.id = p_room_id
  and public.rooms.game = 'true'
  and public.rooms.status = 'playing';

  if not found then
    raise exception 'room_not_playing';
  end if;
end;
$$;

create function public.submit_true_entries_rpc(
  p_room_id uuid,
  p_real_text text,
  p_fake_text text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
  v_user_id text;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  v_user_id := (select auth.uid())::text;

  if length(trim(coalesce(p_real_text, ''))) < 12 or length(trim(coalesce(p_fake_text, ''))) < 12 then
    raise exception 'entry_too_short';
  end if;

  if not exists (
    select 1
    from public.room_players
    where room_id = p_room_id
    and user_id = (select auth.uid())
  ) then
    raise exception 'not_room_player';
  end if;

  select settings -> 'true' -> 'state'
  into v_state
  from public.rooms
  where public.rooms.id = p_room_id
  and public.rooms.game = 'true'
  and public.rooms.status = 'playing'
  for update;

  if v_state is null then
    raise exception 'room_not_playing';
  end if;

  if coalesce(v_state ->> 'status', '') <> 'writing' then
    return;
  end if;

  if (v_state -> 'entries') ? v_user_id then
    return;
  end if;

  update public.rooms
  set settings = jsonb_set(
    coalesce(settings, '{}'::jsonb),
    '{true,state}',
    jsonb_set(
      jsonb_set(v_state, '{entries}', coalesce(v_state -> 'entries', '{}'::jsonb), true),
      array['entries', v_user_id],
      jsonb_build_object('real', left(trim(p_real_text), 160), 'fake', left(trim(p_fake_text), 160)),
      true
    ),
    true
  )
  where public.rooms.id = p_room_id
  and public.rooms.game = 'true'
  and public.rooms.status = 'playing';
end;
$$;

create function public.submit_true_vote_rpc(
  p_room_id uuid,
  p_owner_id text,
  p_truth boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
  v_user_id text;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  v_user_id := (select auth.uid())::text;

  if not exists (
    select 1
    from public.room_players
    where room_id = p_room_id
    and user_id = (select auth.uid())
  ) then
    raise exception 'not_room_player';
  end if;

  select settings -> 'true' -> 'state'
  into v_state
  from public.rooms
  where public.rooms.id = p_room_id
  and public.rooms.game = 'true'
  and public.rooms.status = 'playing'
  for update;

  if v_state is null then
    raise exception 'room_not_playing';
  end if;

  if coalesce(v_state ->> 'status', '') <> 'voting' then
    return;
  end if;

  if (v_state -> 'votes') ? v_user_id then
    return;
  end if;

  update public.rooms
  set settings = jsonb_set(
    coalesce(settings, '{}'::jsonb),
    '{true,state}',
    jsonb_set(
      jsonb_set(v_state, '{votes}', coalesce(v_state -> 'votes', '{}'::jsonb), true),
      array['votes', v_user_id],
      jsonb_build_object('ownerId', p_owner_id, 'truth', coalesce(p_truth, false)),
      true
    ),
    true
  )
  where public.rooms.id = p_room_id
  and public.rooms.game = 'true'
  and public.rooms.status = 'playing';
end;
$$;

create function public.leave_room_rpc(
  p_room_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_room public.rooms;
  v_state public.blackjack_room_states;
  v_was_host boolean;
  v_next_host uuid;
  v_bet integer := 0;
  v_hands jsonb;
  v_hand jsonb;
  v_refundable boolean := false;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_room from public.rooms where id = p_room_id;

  if v_room.game = 'blackjack' then
    select * into v_state from public.blackjack_room_states where room_id = p_room_id for update;
    if v_state.room_id is not null and v_state.bets ? v_uid::text then
      v_bet := coalesce((v_state.bets ->> v_uid::text)::integer, 0);
      v_hands := coalesce(v_state.player_hands -> v_uid::text, '[]'::jsonb);
      v_refundable := v_state.phase = 'betting';

      if not v_refundable and v_state.phase = 'playing' and jsonb_array_length(v_hands) = 1 then
        v_refundable := true;
        for v_hand in select value from jsonb_array_elements(v_hands) loop
          if jsonb_array_length(coalesce(v_hand -> 'cards', '[]'::jsonb)) <> 2
             or coalesce(v_hand ->> 'status', 'playing') not in ('playing', 'blackjack')
             or coalesce(v_state.hand_flags -> v_uid::text, '{}'::jsonb) <> '{}'::jsonb then
            v_refundable := false;
          end if;
        end loop;
      end if;

      if v_refundable and v_bet > 0 then
        update public.profiles
        set coins = coins + v_bet
        where id = v_uid;
      end if;

      update public.blackjack_room_states
      set bets = bets - v_uid::text,
          hand_bets = hand_bets - v_uid::text,
          hand_flags = hand_flags - v_uid::text,
          player_hands = player_hands - v_uid::text,
          results = results - v_uid::text,
          current_player = case when current_player = v_uid then null else current_player end,
          updated_at = now()
      where room_id = p_room_id;
    end if;
  end if;

  select exists (
    select 1
    from public.rooms
    where public.rooms.id = p_room_id
    and host_id = v_uid
  ) into v_was_host;

  delete from public.room_players
  where room_id = p_room_id
  and user_id = v_uid;

  if v_was_host then
    select user_id
    into v_next_host
    from public.room_players
    where room_id = p_room_id
    order by joined_at asc
    limit 1;

    if v_next_host is null then
      delete from public.rooms
      where public.rooms.id = p_room_id;
    else
      update public.rooms
      set host_id = v_next_host
      where public.rooms.id = p_room_id;
    end if;
  end if;

  if v_room.game = 'blackjack' and exists (select 1 from public.rooms where id = p_room_id) then
    if exists (select 1 from public.blackjack_room_states where room_id = p_room_id and phase = 'playing' and current_player is null) then
      execute 'select public.blackjack_advance_turn($1)' using p_room_id;
    else
      execute 'select public.blackjack_sync_public_state($1)' using p_room_id;
    end if;
  end if;
end;
$$;

create or replace function public.update_player_presence_rpc(
  p_room_id uuid,
  p_presence_device text default 'desktop'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  update public.room_players
  set last_seen_at = now(),
      presence_device = case
        when p_presence_device = 'mobile' then 'mobile'
        else 'desktop'
      end
  where room_id = p_room_id
  and user_id = (select auth.uid());
end;
$$;

create or replace function public.cleanup_stale_room_players_rpc(
  p_room_id uuid,
  p_stale_after_seconds integer default 28,
  p_mobile_only boolean default true
)
returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_deleted uuid[] := '{}';
  v_next_host uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.room_players
    where room_id = p_room_id
    and user_id = v_uid
  ) then
    raise exception 'not_room_player';
  end if;

  with deleted as (
    delete from public.room_players
    where room_id = p_room_id
    and user_id <> v_uid
    and last_seen_at < now() - make_interval(secs => greatest(18, p_stale_after_seconds))
    and (not p_mobile_only or presence_device = 'mobile')
    returning user_id
  )
  select coalesce(array_agg(user_id), '{}') into v_deleted
  from deleted;

  if exists (
    select 1
    from public.rooms
    where id = p_room_id
    and host_id = any(v_deleted)
  ) then
    select user_id
    into v_next_host
    from public.room_players
    where room_id = p_room_id
    order by joined_at asc
    limit 1;

    if v_next_host is null then
      delete from public.rooms
      where id = p_room_id;
    else
      update public.rooms
      set host_id = v_next_host
      where id = p_room_id;
    end if;
  end if;

  return v_deleted;
end;
$$;

create or replace function public.cleanup_old_rooms_rpc(
  p_finished_after_hours integer default 6,
  p_abandoned_after_hours integer default 24,
  p_empty_lobby_after_hours integer default 12
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer := 0;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  with old_rooms as (
    select r.id
    from public.rooms r
    where
      (
        r.status = 'playing'
        and r.created_at < now() - make_interval(hours => greatest(1, p_finished_after_hours))
        and (
          coalesce(r.settings #>> '{who,state,status}', '') = 'finished'
          or coalesce(r.settings #>> '{true,state,status}', '') = 'finished'
          or coalesce(r.settings #>> '{photo,state,status}', '') = 'finished'
          or coalesce(r.settings #>> '{liars,state,winner}', '') <> ''
          or coalesce(r.settings #>> '{liars,state,phase}', '') = 'game_over'
        )
      )
      or (
        r.status = 'lobby'
        and r.created_at < now() - make_interval(hours => greatest(1, p_empty_lobby_after_hours))
        and not exists (
          select 1
          from public.room_players rp
          where rp.room_id = r.id
        )
      )
      or (
        r.created_at < now() - make_interval(hours => greatest(1, p_abandoned_after_hours))
        and not exists (
          select 1
          from public.room_players rp
          where rp.room_id = r.id
          and rp.last_seen_at >= now() - make_interval(hours => greatest(1, p_abandoned_after_hours))
        )
      )
  ),
  deleted as (
    delete from public.rooms
    where id in (select id from old_rooms)
    returning id
  )
  select count(*) into v_deleted
  from deleted;

  return v_deleted;
end;
$$;

create or replace function public.dead21_card_value(p_rank text)
returns integer
language sql
immutable
as $$
  select case p_rank
    when 'As' then 11
    when 'Roi' then 10
    when 'Dame' then 10
    when 'Valet' then 10
    else p_rank::integer
  end;
$$;

create or replace function public.dead21_card_label(p_rank text)
returns text
language sql
immutable
as $$
  select case p_rank
    when '2' then '2'
    when '3' then '3'
    when '4' then '4'
    when '5' then '5'
    when '6' then '6'
    when '7' then '7'
    when '8' then '8'
    when '9' then '9'
    when '10' then '10'
    else p_rank
  end;
$$;

create or replace function public.dead21_card_images(p_rank text)
returns text[]
language sql
immutable
as $$
  select case p_rank
    when '2' then array['deuxpique.png','deuxcoeur.png']
    when '3' then array['troistrefle.png','troiscarreau.png']
    when '4' then array['quatrepique.png','quatrecoeur.png']
    when '5' then array['cinqtrefle.png','cinqcarreau.png']
    when '6' then array['sixpique.png','sixcoeur.png']
    when '7' then array['septtrefle.png','septcarreau.png']
    when '8' then array['huitpique.png','huitcoeur.png']
    when '9' then array['neuftrefle.png','neufcarreau.png']
    when '10' then array['dixpique.png','dixcoeur.png']
    when 'As' then array['aspique.png','ascoeur.png','astrefle.png','ascarreau.png']
    when 'Valet' then array['valetpique.png','valetcoeur.png','valettrefle.png','valetcarreau.png']
    when 'Dame' then array['damepique.png','damecoeur.png','dametrefle.png','damecarreau.png']
    when 'Roi' then array['roipique.png','roicoeur.png','roitrefle.png','roicarreau.png']
    else array[]::text[]
  end;
$$;

create or replace function public.dead21_make_card(p_rank text)
returns jsonb
language plpgsql
as $$
declare
  v_images text[] := public.dead21_card_images(p_rank);
  v_image text;
begin
  v_image := v_images[1 + floor(random() * greatest(array_length(v_images, 1), 1))::integer];
  return jsonb_build_object(
    'id', gen_random_uuid()::text,
    'rank', p_rank,
    'label', public.dead21_card_label(p_rank),
    'value', public.dead21_card_value(p_rank),
    'image', v_image
  );
end;
$$;

create or replace function public.dead21_build_deck()
returns jsonb
language plpgsql
as $$
declare
  v_deck jsonb := '[]'::jsonb;
  v_counts jsonb := '{}'::jsonb;
  v_rank text;
  v_next_count integer;
  v_figures text[] := array['Roi','Dame','Valet'];
  v_numbers text[] := array['2','3','4','5','6','7','8','9','10'];
  i integer;
begin
  for i in 1..4 loop
    loop
      v_rank := v_figures[1 + floor(random() * array_length(v_figures, 1))::integer];
      v_next_count := coalesce((v_counts ->> v_rank)::integer, 0) + 1;
      exit when v_next_count <= 4;
    end loop;
    v_counts := jsonb_set(v_counts, array[v_rank], to_jsonb(v_next_count), true);
    v_deck := v_deck || jsonb_build_array(public.dead21_make_card(v_rank));
  end loop;

  for i in 1..9 loop
    loop
      v_rank := v_numbers[1 + floor(random() * array_length(v_numbers, 1))::integer];
      v_next_count := coalesce((v_counts ->> v_rank)::integer, 0) + 1;
      exit when v_next_count <= 4;
    end loop;
    v_counts := jsonb_set(v_counts, array[v_rank], to_jsonb(v_next_count), true);
    v_deck := v_deck || jsonb_build_array(public.dead21_make_card(v_rank));
  end loop;

  v_deck := v_deck || jsonb_build_array(public.dead21_make_card('As'));

  select coalesce(jsonb_agg(value), '[]'::jsonb)
  into v_deck
  from (
    select value
    from jsonb_array_elements(v_deck) value
    order by random()
  ) shuffled;

  return v_deck;
end;
$$;

create or replace function public.dead21_public_maps(p_room_id uuid)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'handCounts', coalesce(jsonb_object_agg(user_id::text, jsonb_array_length(hand)), '{}'::jsonb),
    'scores', coalesce(jsonb_object_agg(user_id::text, case when stayed or eliminated then to_jsonb(score) else 'null'::jsonb end), '{}'::jsonb),
    'stayed', coalesce(jsonb_object_agg(user_id::text, stayed), '{}'::jsonb),
    'turnCounts', coalesce(jsonb_object_agg(user_id::text, turn_count), '{}'::jsonb),
    'rouletteDanger', coalesce(jsonb_object_agg(user_id::text, danger), '{}'::jsonb),
    'eliminated', coalesce(jsonb_object_agg(user_id::text, eliminated), '{}'::jsonb)
  )
  from public.dead21_player_states
  where room_id = p_room_id;
$$;

create or replace function public.dead21_start_round_internal(
  p_room_id uuid,
  p_base_state jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deck jsonb := public.dead21_build_deck();
  v_intro_deck jsonb;
  v_rest jsonb;
  v_round integer;
  v_player record;
  v_hand jsonb;
  v_alive_ids text[];
  v_first_id text;
  v_state jsonb;
  v_maps jsonb;
  v_intro_id text;
begin
  v_intro_deck := v_deck;

  select coalesce(round, 0) + 1
  into v_round
  from public.dead21_room_states
  where room_id = p_room_id;

  if v_round is null then
    v_round := 1;
  end if;

  v_intro_id := extract(epoch from clock_timestamp())::text || '-' || v_round::text;

  insert into public.dead21_room_states (room_id, deck, round)
  values (p_room_id, v_deck, v_round)
  on conflict (room_id) do update
  set deck = excluded.deck,
      round = excluded.round,
      updated_at = now();

  for v_player in
    select value::uuid as user_id
    from jsonb_array_elements_text(coalesce(p_base_state -> 'order', '[]'::jsonb)) value
    where (p_base_state -> 'eliminated' ->> value) is distinct from 'true'
  loop
    select coalesce(jsonb_agg(value), '[]'::jsonb)
    into v_hand
    from (
      select value
      from jsonb_array_elements(v_deck) with ordinality as cards(value, ord)
      where ord <= 2
      order by ord
    ) dealt;

    select coalesce(jsonb_agg(value), '[]'::jsonb)
    into v_rest
    from (
      select value
      from jsonb_array_elements(v_deck) with ordinality as cards(value, ord)
      where ord > 2
      order by ord
    ) rest_cards;

    v_deck := coalesce(v_rest, '[]'::jsonb);

    insert into public.dead21_player_states (room_id, user_id, hand, played, pending_draw, score, turn_count, stayed, danger, eliminated)
    values (
      p_room_id,
      v_player.user_id,
      v_hand,
      '[]'::jsonb,
      null,
      0,
      0,
      false,
      coalesce((p_base_state -> 'rouletteDanger' ->> v_player.user_id::text)::integer, 1),
      false
    )
    on conflict (room_id, user_id) do update
    set hand = excluded.hand,
        played = '[]'::jsonb,
        pending_draw = null,
        score = 0,
        turn_count = 0,
        stayed = false,
        danger = excluded.danger,
        eliminated = false;
  end loop;

  update public.dead21_room_states
  set deck = v_deck,
      updated_at = now()
  where room_id = p_room_id;

  update public.dead21_player_states
  set hand = '[]'::jsonb,
      pending_draw = null,
      stayed = true,
      eliminated = true
  where room_id = p_room_id
  and (p_base_state -> 'eliminated' ->> user_id::text) = 'true';

  select array_agg(value)
  into v_alive_ids
  from jsonb_array_elements_text(coalesce(p_base_state -> 'order', '[]'::jsonb)) value
  where (p_base_state -> 'eliminated' ->> value) is distinct from 'true';

  v_first_id := v_alive_ids[1];
  v_maps := public.dead21_public_maps(p_room_id);

  v_state := p_base_state
    || jsonb_build_object(
      'mode', 'dead21',
      'phase', 'deck_intro',
      'round', v_round,
      'currentIndex', greatest(array_position(v_alive_ids, v_first_id) - 1, 0),
      'lastPlay', null,
      'reveal', null,
      'deckIntro', jsonb_build_object(
        'id', v_intro_id,
        'round', v_round,
        'cards', v_intro_deck
      ),
      'deckPreview', jsonb_build_object(
        'id', v_intro_id,
        'round', v_round,
        'cards', v_intro_deck
      ),
      'announcedScores', '{}'::jsonb,
      'announcement', 'Deck de la manche.',
      'turnText', 'Tour de ' || coalesce(p_base_state -> 'names' ->> v_first_id, 'Joueur') || '.',
      'version', coalesce((p_base_state ->> 'version')::integer, 0) + 1
    )
    || v_maps;

  return v_state;
end;
$$;

create or replace function public.start_dead21_room_rpc(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_state jsonb;
  v_started jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.rooms
    where id = p_room_id
    and game = 'liars'
    and host_id = (select auth.uid())
    and status = 'lobby'
  ) then
    raise exception 'not_room_host';
  end if;

  select count(*) into v_count
  from public.room_players
  where room_id = p_room_id;

  if v_count < 2 or v_count > 4 then
    raise exception 'dead21_requires_2_to_4_players';
  end if;

  delete from public.dead21_player_states where room_id = p_room_id;
  delete from public.dead21_room_states where room_id = p_room_id;

  select jsonb_build_object(
    'gameId', extract(epoch from clock_timestamp())::text || '-' || substr(md5(random()::text), 1, 8),
    'mode', 'dead21',
    'order', coalesce(jsonb_agg(rp.user_id::text order by rp.shuffle_order), '[]'::jsonb),
    'names', coalesce(jsonb_object_agg(rp.user_id::text, rp.pseudo), '{}'::jsonb),
    'weaponSkins', coalesce(jsonb_object_agg(rp.user_id::text, rp.weapon_skin), '{}'::jsonb),
    'nameSkins', coalesce(jsonb_object_agg(rp.user_id::text, rp.name_skin), '{}'::jsonb),
    'deathSkins', coalesce(jsonb_object_agg(rp.user_id::text, rp.death_skin), '{}'::jsonb),
    'eliminationOrder', '[]'::jsonb,
    'events', '[]'::jsonb,
    'coinRewards', '{}'::jsonb,
    'coinRewardEvents', '[]'::jsonb,
    'stats', '{}'::jsonb,
    'winner', null,
    'version', 0
  )
  into v_state
  from (
    select rp.*,
           row_number() over (order by random()) as shuffle_order
    from public.room_players rp
    where rp.room_id = p_room_id
  ) rp;

  v_started := public.dead21_start_round_internal(p_room_id, v_state);

  update public.rooms
  set status = 'playing',
      settings = jsonb_set(
        jsonb_set(coalesce(settings, '{}'::jsonb), '{liars,mode}', '"dead21"'::jsonb, true),
        '{liars,state}',
        v_started,
        true
      )
  where id = p_room_id
  and game = 'liars'
  and host_id = (select auth.uid())
  and status = 'lobby';

  if not found then
    raise exception 'not_room_host';
  end if;
end;
$$;

create or replace function public.get_dead21_private_state_rpc(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_private jsonb;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select jsonb_build_object(
    'hand', hand,
    'pendingDraw', pending_draw,
    'score', score,
    'turnCount', turn_count,
    'stayed', stayed
  )
  into v_private
  from public.dead21_player_states
  where room_id = p_room_id
  and user_id = v_uid;

  if v_private is null then
    raise exception 'not_room_player';
  end if;

return v_private;
end;
$$;

create or replace function public.dead21_award_state_reward(
  p_room_id uuid,
  p_state jsonb,
  p_reward_type text,
  p_rewarded_user_id uuid,
  p_source_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount integer;
  v_game_id text := coalesce(p_state ->> 'gameId', p_room_id::text);
  v_reward_key text;
  v_total integer;
begin
  if p_rewarded_user_id is null then
    return p_state;
  end if;

  if not exists (
    select 1 from public.room_players
    where room_id = p_room_id
    and user_id = p_rewarded_user_id
  ) then
    return p_state;
  end if;

  v_amount := case p_reward_type
    when 'accuse_success' then 50
    when 'round_survivor' then 50
    when 'winner' then 100
    when 'second_place' then 50
    else null
  end;

  if v_amount is null then
    return p_state;
  end if;

  v_reward_key := v_game_id || ':' || p_reward_type || ':' || p_rewarded_user_id::text || ':' || coalesce(p_source_key, 'dead21');

  insert into public.coin_rewards (room_id, game_id, user_id, reward_type, reward_key, amount)
  values (p_room_id, v_game_id, p_rewarded_user_id, p_reward_type, v_reward_key, v_amount)
  on conflict (reward_key) do nothing;

  if found then
    update public.profiles
    set coins = coalesce(coins, 0) + v_amount
    where id = p_rewarded_user_id;

    v_total := coalesce((p_state #>> array['coinRewards', p_rewarded_user_id::text])::integer, 0) + v_amount;
    p_state := jsonb_set(p_state, array['coinRewards', p_rewarded_user_id::text], to_jsonb(v_total), true);
    p_state := jsonb_set(
      p_state,
      '{coinRewardEvents}',
      coalesce(p_state -> 'coinRewardEvents', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
        'userId', p_rewarded_user_id::text,
        'type', p_reward_type,
        'amount', v_amount,
        'key', v_reward_key
      )),
      true
    );
  end if;

  return p_state;
end;
$$;

create or replace function public.dead21_award_game_end_rewards(
  p_room_id uuid,
  p_state jsonb,
  p_source_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first uuid;
  v_second uuid;
begin
  select user_id into v_first
  from public.dead21_player_states
  where room_id = p_room_id
  and not eliminated
  order by user_id
  limit 1;

  if v_first is null then
    select value::uuid into v_first
    from jsonb_array_elements_text(coalesce(p_state -> 'eliminationOrder', '[]'::jsonb)) with ordinality as e(value, ord)
    order by ord desc
    limit 1;
  end if;

  if v_first is not null then
    p_state := public.dead21_award_state_reward(p_room_id, p_state, 'winner', v_first, p_source_key);
  end if;

  select value::uuid into v_second
  from jsonb_array_elements_text(coalesce(p_state -> 'eliminationOrder', '[]'::jsonb)) with ordinality as e(value, ord)
  where v_first is null or value <> v_first::text
  order by ord desc
  limit 1;

  if v_second is not null then
    p_state := public.dead21_award_state_reward(p_room_id, p_state, 'second_place', v_second, p_source_key);
  end if;

  return p_state;
end;
$$;

create or replace function public.dead21_apply_shot(
  p_room_id uuid,
  p_state jsonb,
  p_player_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_private public.dead21_player_states;
  v_dead boolean;
  v_roll integer;
  v_names jsonb := coalesce(p_state -> 'names', '{}'::jsonb);
begin
  select * into v_private
  from public.dead21_player_states
  where room_id = p_room_id
  and user_id = p_player_id
  for update;

  if not found or v_private.eliminated then
    return jsonb_build_object('state', p_state, 'shot', null);
  end if;

  v_roll := 1 + floor(random() * 4)::integer;
  v_dead := v_roll <= greatest(1, least(4, v_private.danger));

  if v_dead then
    update public.dead21_player_states
    set eliminated = true,
        hand = '[]'::jsonb,
        pending_draw = null,
        stayed = true
    where room_id = p_room_id
    and user_id = p_player_id;

    p_state := jsonb_set(p_state, array['eliminated', p_player_id::text], 'true'::jsonb, true);
    p_state := jsonb_set(p_state, '{eliminationOrder}', coalesce(p_state -> 'eliminationOrder', '[]'::jsonb) || jsonb_build_array(p_player_id::text), true);
  else
    update public.dead21_player_states
    set danger = least(4, danger + 1)
    where room_id = p_room_id
    and user_id = p_player_id;

    p_state := jsonb_set(p_state, array['rouletteDanger', p_player_id::text], to_jsonb(least(4, v_private.danger + 1)), true);
  end if;

  return jsonb_build_object(
    'state', p_state,
    'shot', jsonb_build_object(
      'playerId', p_player_id::text,
      'name', coalesce(v_names ->> p_player_id::text, 'Joueur'),
      'dead', v_dead,
      'dangerBefore', v_private.danger,
      'roll', v_roll
    )
  );
end;
$$;

create or replace function public.dead21_finish_round_internal(
  p_room_id uuid,
  p_state jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_best integer;
  v_player record;
  v_result jsonb;
  v_shot jsonb;
  v_shots jsonb := '[]'::jsonb;
  v_alive_count integer;
  v_winner text;
  v_maps jsonb;
  v_all_scores jsonb;
  v_round integer;
  v_reveal_id text := extract(epoch from clock_timestamp())::text;
begin
  select round into v_round
  from public.dead21_room_states
  where room_id = p_room_id;

  select max(score) into v_best
  from public.dead21_player_states
  where room_id = p_room_id
  and not eliminated
  and score <= 21;

  for v_player in
    select user_id, score
    from public.dead21_player_states
    where room_id = p_room_id
    and not eliminated
    and (v_best is null or score <> v_best or score > 21)
    order by user_id
  loop
    v_result := public.dead21_apply_shot(p_room_id, p_state, v_player.user_id);
    p_state := v_result -> 'state';
    v_shot := v_result -> 'shot';
    if v_shot is not null then
      v_shots := v_shots || jsonb_build_array(v_shot);
    end if;
  end loop;

  for v_player in
    select user_id
    from public.dead21_player_states
    where room_id = p_room_id
    and not eliminated
    order by user_id
  loop
    p_state := public.dead21_award_state_reward(
      p_room_id,
      p_state,
      'round_survivor',
      v_player.user_id,
      'round-' || coalesce(v_round, 0)::text
    );
  end loop;

  select count(*), min(user_id::text)
  into v_alive_count, v_winner
  from public.dead21_player_states
  where room_id = p_room_id
  and not eliminated;

  if v_alive_count <= 0 then
    select value into v_winner
    from jsonb_array_elements_text(coalesce(p_state -> 'eliminationOrder', '[]'::jsonb)) with ordinality as e(value, ord)
    order by ord desc
    limit 1;
  end if;

  select coalesce(jsonb_object_agg(user_id::text, score), '{}'::jsonb)
  into v_all_scores
  from public.dead21_player_states
  where room_id = p_room_id;

  v_maps := public.dead21_public_maps(p_room_id);
  p_state := p_state || v_maps;
  p_state := jsonb_set(p_state, '{phase}', '"round_reveal"'::jsonb, true);
  p_state := jsonb_set(p_state, '{lastPlay}', 'null'::jsonb, true);
  p_state := jsonb_set(p_state, '{reveal}', jsonb_build_object(
    'id', v_reveal_id,
    'type', 'final',
    'bestScore', v_best,
    'shots', v_shots,
    'scores', v_all_scores
  ), true);

  if v_alive_count <= 1 then
    p_state := public.dead21_award_game_end_rewards(p_room_id, p_state, 'game-end-' || v_reveal_id);
    p_state := jsonb_set(p_state, '{winner}', coalesce(to_jsonb(v_winner), 'null'::jsonb), true);
    p_state := jsonb_set(p_state, '{phase}', '"game_over"'::jsonb, true);
    p_state := jsonb_set(
      p_state,
      '{announcement}',
      to_jsonb(case when v_winner is null then 'Tous les joueurs sont éliminés.' else coalesce(p_state -> 'names' ->> v_winner, 'Joueur') || ' gagne la partie.' end),
      true
    );
  else
    p_state := jsonb_set(p_state, '{announcement}', '"Fin de manche Dead 21."'::jsonb, true);
  end if;

  p_state := jsonb_set(p_state, '{version}', to_jsonb(coalesce((p_state ->> 'version')::integer, 0) + 1), true);
  return p_state;
end;
$$;

create or replace function public.dead21_after_action_internal(
  p_room_id uuid,
  p_state jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order text[];
  v_current integer := coalesce((p_state ->> 'currentIndex')::integer, 0);
  v_len integer;
  v_offset integer;
  v_candidate text;
  v_round_over boolean;
  v_maps jsonb;
begin
  select coalesce(array_agg(value), array[]::text[])
  into v_order
  from jsonb_array_elements_text(coalesce(p_state -> 'order', '[]'::jsonb)) value;
  v_len := coalesce(array_length(v_order, 1), 0);

  if v_len <= 0 then
    return public.dead21_finish_round_internal(p_room_id, p_state);
  end if;

  select not exists (
    select 1
    from public.dead21_player_states
    where room_id = p_room_id
    and not eliminated
    and not stayed
    and jsonb_array_length(hand) > 0
  )
  into v_round_over;

  if v_round_over then
    return public.dead21_finish_round_internal(p_room_id, p_state);
  end if;

  for v_offset in 1..greatest(v_len, 1) loop
    v_candidate := v_order[((v_current + v_offset) % v_len) + 1];
    if exists (
      select 1
      from public.dead21_player_states
      where room_id = p_room_id
      and user_id = v_candidate::uuid
      and not eliminated
      and not stayed
      and jsonb_array_length(hand) > 0
    ) then
      v_maps := public.dead21_public_maps(p_room_id);
      p_state := p_state || v_maps;
      p_state := jsonb_set(p_state, '{currentIndex}', to_jsonb(((v_current + v_offset) % v_len)), true);
      p_state := jsonb_set(p_state, '{turnText}', to_jsonb('Tour de ' || coalesce(p_state -> 'names' ->> v_candidate, 'Joueur') || '.'), true);
      p_state := jsonb_set(p_state, '{phase}', '"playing"'::jsonb, true);
      p_state := jsonb_set(p_state, '{version}', to_jsonb(coalesce((p_state ->> 'version')::integer, 0) + 1), true);
      return p_state;
    end if;
  end loop;

  return public.dead21_finish_round_internal(p_room_id, p_state);
end;
$$;

create or replace function public.dead21_forfeit_player_rpc(
  p_room_id uuid,
  p_player_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_target uuid := coalesce(p_player_id, (select auth.uid()));
  v_state jsonb;
  v_is_host boolean;
  v_target_text text;
  v_order jsonb;
  v_old_index integer := 0;
  v_new_len integer := 0;
  v_seed_index integer := -1;
  v_alive_count integer;
  v_winner text;
  v_end_id text := extract(epoch from clock_timestamp())::text;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select host_id = v_uid,
         settings #> '{liars,state}'
  into v_is_host, v_state
  from public.rooms
  where id = p_room_id
  and game = 'liars'
  and status = 'playing'
  for update;

  if v_state is null or v_state ->> 'mode' <> 'dead21' then
    raise exception 'not_dead21';
  end if;

  if v_target is distinct from v_uid and not coalesce(v_is_host, false) then
    raise exception 'not_allowed';
  end if;

  if v_state ? 'winner' and v_state ->> 'winner' is not null then
    return;
  end if;

  v_target_text := v_target::text;

  select greatest(ord::integer - 1, 0)
  into v_old_index
  from jsonb_array_elements_text(coalesce(v_state -> 'order', '[]'::jsonb)) with ordinality as ordered(value, ord)
  where value = v_target_text
  limit 1;

  v_old_index := coalesce(v_old_index, coalesce((v_state ->> 'currentIndex')::integer, 0));

  update public.dead21_player_states
  set eliminated = true,
      stayed = true,
      hand = '[]'::jsonb,
      pending_draw = null
  where room_id = p_room_id
  and user_id = v_target;

  select coalesce(jsonb_agg(value), '[]'::jsonb)
  into v_order
  from jsonb_array_elements_text(coalesce(v_state -> 'order', '[]'::jsonb)) value
  where value <> v_target_text;

  v_new_len := jsonb_array_length(v_order);
  if v_new_len > 0 then
    v_seed_index := (v_old_index % v_new_len) - 1;
  end if;

  v_state := jsonb_set(v_state, '{order}', v_order, true);
  v_state := jsonb_set(v_state, '{currentIndex}', to_jsonb(v_seed_index), true);
  v_state := jsonb_set(v_state, array['eliminated', v_target_text], 'true'::jsonb, true);
  v_state := jsonb_set(v_state, '{eliminationOrder}', coalesce(v_state -> 'eliminationOrder', '[]'::jsonb) || jsonb_build_array(v_target_text), true);
  v_state := jsonb_set(v_state, '{lastPlay}', 'null'::jsonb, true);
  v_state := jsonb_set(v_state, '{reveal}', 'null'::jsonb, true);
  v_state := jsonb_set(v_state, '{deckIntro}', 'null'::jsonb, true);
  v_state := jsonb_set(v_state, '{announcement}', to_jsonb(coalesce(v_state -> 'names' ->> v_target_text, 'Joueur') || ' quitte la table.'), true);

  select count(*), min(value)
  into v_alive_count, v_winner
  from jsonb_array_elements_text(v_order) value
  where (v_state -> 'eliminated' ->> value) is distinct from 'true';

  if v_alive_count <= 0 then
    select value into v_winner
    from jsonb_array_elements_text(coalesce(v_state -> 'eliminationOrder', '[]'::jsonb)) with ordinality as e(value, ord)
    order by ord desc
    limit 1;
  end if;

  if v_alive_count <= 1 then
    v_state := v_state || public.dead21_public_maps(p_room_id);
    v_state := public.dead21_award_game_end_rewards(p_room_id, v_state, 'forfeit-' || v_end_id);
    v_state := jsonb_set(v_state, '{winner}', coalesce(to_jsonb(v_winner), 'null'::jsonb), true);
    v_state := jsonb_set(v_state, '{phase}', '"game_over"'::jsonb, true);
    v_state := jsonb_set(v_state, '{turnText}', to_jsonb(case when v_winner is null then 'Fin de partie' else coalesce(v_state -> 'names' ->> v_winner, 'Joueur') || ' gagne par forfait.' end), true);
    v_state := jsonb_set(v_state, '{version}', to_jsonb(coalesce((v_state ->> 'version')::integer, 0) + 1), true);
  else
    v_state := jsonb_set(v_state, '{phase}', '"playing"'::jsonb, true);
    v_state := public.dead21_after_action_internal(p_room_id, v_state);
  end if;

  update public.rooms
  set settings = jsonb_set(settings, '{liars,state}', v_state, true)
  where id = p_room_id;
end;
$$;

create or replace function public.dead21_play_card_rpc(
  p_room_id uuid,
  p_card_id text,
  p_announced_value integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_state jsonb;
  v_private public.dead21_player_states;
  v_current_id text;
  v_card jsonb;
  v_new_hand jsonb;
  v_value integer;
  v_truth boolean;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select settings #> '{liars,state}'
  into v_state
  from public.rooms
  where id = p_room_id
  and game = 'liars'
  and status = 'playing'
  for update;

  if v_state is null or v_state ->> 'mode' <> 'dead21' then raise exception 'not_dead21'; end if;
  if v_state ->> 'phase' <> 'playing' then raise exception 'phase_blocked'; end if;

  v_current_id := v_state -> 'order' ->> coalesce((v_state ->> 'currentIndex')::integer, 0);
  if v_current_id is distinct from v_uid::text then raise exception 'wrong_turn'; end if;

  select * into v_private
  from public.dead21_player_states
  where room_id = p_room_id and user_id = v_uid
  for update;

  if not found or v_private.eliminated or v_private.stayed then raise exception 'invalid_player'; end if;
  if v_private.pending_draw is not null then raise exception 'must_resolve_draw'; end if;

  select value into v_card
  from jsonb_array_elements(v_private.hand) value
  where value ->> 'id' = p_card_id
  limit 1;

  if v_card is null then raise exception 'card_not_in_hand'; end if;

  v_value := (v_card ->> 'value')::integer;
  if (v_card ->> 'rank') = 'As' then
    if p_announced_value not in (10, 11) then raise exception 'invalid_announcement'; end if;
  elsif v_value = 2 then
    if p_announced_value not in (2, 3) then raise exception 'invalid_announcement'; end if;
  elsif p_announced_value < v_value - 1 or p_announced_value > v_value + 1 then
    raise exception 'invalid_announcement';
  elsif p_announced_value < 2 then
    raise exception 'invalid_announcement';
  end if;

  select coalesce(jsonb_agg(value), '[]'::jsonb)
  into v_new_hand
  from jsonb_array_elements(v_private.hand) value
  where value ->> 'id' <> p_card_id;

  v_truth := p_announced_value = v_value;

  update public.dead21_player_states
  set hand = v_new_hand,
      played = played || jsonb_build_array(v_card || jsonb_build_object('announcedValue', p_announced_value, 'truth', v_truth)),
      score = score + v_value,
      turn_count = turn_count + 1
  where room_id = p_room_id and user_id = v_uid;

  v_state := jsonb_set(v_state, '{lastPlay}', jsonb_build_object(
    'playerId', v_uid::text,
    'cardId', p_card_id,
    'announcedValue', p_announced_value,
    'revealed', false
  ), true);
  v_state := jsonb_set(v_state, '{announcement}', to_jsonb(coalesce(v_state -> 'names' ->> v_uid::text, 'Joueur') || ' annonce ' || p_announced_value || '.'), true);
  v_state := jsonb_set(v_state, array['announcedScores', v_uid::text], to_jsonb(coalesce((v_state -> 'announcedScores' ->> v_uid::text)::integer, 0) + p_announced_value), true);
  v_state := public.dead21_after_action_internal(p_room_id, v_state);

  update public.rooms
  set settings = jsonb_set(settings, '{liars,state}', v_state, true)
  where id = p_room_id;
end;
$$;

create or replace function public.dead21_draw_card_rpc(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_state jsonb;
  v_private public.dead21_player_states;
  v_current_id text;
  v_deck jsonb;
  v_card jsonb;
  v_rest jsonb;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select settings #> '{liars,state}' into v_state
  from public.rooms
  where id = p_room_id and game = 'liars' and status = 'playing'
  for update;

  if v_state is null or v_state ->> 'mode' <> 'dead21' then raise exception 'not_dead21'; end if;
  if v_state ->> 'phase' <> 'playing' then raise exception 'phase_blocked'; end if;
  v_current_id := v_state -> 'order' ->> coalesce((v_state ->> 'currentIndex')::integer, 0);
  if v_current_id is distinct from v_uid::text then raise exception 'wrong_turn'; end if;

  select * into v_private
  from public.dead21_player_states
  where room_id = p_room_id and user_id = v_uid
  for update;

  if not found or v_private.eliminated or v_private.stayed then raise exception 'invalid_player'; end if;
  if v_private.turn_count <= 0 then raise exception 'draw_forbidden_first_turn'; end if;
  if v_private.pending_draw is not null then raise exception 'draw_already_pending'; end if;
  if jsonb_array_length(v_private.hand) >= 2 then raise exception 'hand_already_full'; end if;

  select deck into v_deck
  from public.dead21_room_states
  where room_id = p_room_id
  for update;

  if jsonb_array_length(coalesce(v_deck, '[]'::jsonb)) <= 0 then
    v_deck := public.dead21_build_deck();
  end if;

  select value into v_card
  from jsonb_array_elements(v_deck) with ordinality as cards(value, ord)
  where ord = 1;

  select coalesce(jsonb_agg(value), '[]'::jsonb)
  into v_rest
  from jsonb_array_elements(v_deck) with ordinality as cards(value, ord)
  where ord > 1;

  update public.dead21_room_states
  set deck = v_rest,
      updated_at = now()
  where room_id = p_room_id;

  update public.dead21_player_states
  set pending_draw = v_card
  where room_id = p_room_id and user_id = v_uid;
end;
$$;

create or replace function public.dead21_play_draw_choice_rpc(
  p_room_id uuid,
  p_played_card_id text,
  p_kept_card_id text,
  p_announced_value integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_state jsonb;
  v_private public.dead21_player_states;
  v_current_id text;
  v_choices jsonb;
  v_played jsonb;
  v_kept jsonb;
  v_value integer;
  v_truth boolean;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select settings #> '{liars,state}' into v_state
  from public.rooms
  where id = p_room_id and game = 'liars' and status = 'playing'
  for update;

  if v_state is null or v_state ->> 'mode' <> 'dead21' then raise exception 'not_dead21'; end if;
  if v_state ->> 'phase' <> 'playing' then raise exception 'phase_blocked'; end if;
  v_current_id := v_state -> 'order' ->> coalesce((v_state ->> 'currentIndex')::integer, 0);
  if v_current_id is distinct from v_uid::text then raise exception 'wrong_turn'; end if;

  select * into v_private
  from public.dead21_player_states
  where room_id = p_room_id and user_id = v_uid
  for update;

  if v_private.pending_draw is null then raise exception 'no_pending_draw'; end if;
  v_choices := v_private.hand || jsonb_build_array(v_private.pending_draw);

  select value into v_played from jsonb_array_elements(v_choices) value where value ->> 'id' = p_played_card_id limit 1;
  select value into v_kept from jsonb_array_elements(v_choices) value where value ->> 'id' = p_kept_card_id limit 1;
  if v_played is null or v_kept is null or p_played_card_id = p_kept_card_id then raise exception 'invalid_draw_choice'; end if;

  v_value := (v_played ->> 'value')::integer;
  if (v_played ->> 'rank') = 'As' then
    if p_announced_value not in (10, 11) then raise exception 'invalid_announcement'; end if;
  elsif v_value = 2 then
    if p_announced_value not in (2, 3) then raise exception 'invalid_announcement'; end if;
  elsif p_announced_value < v_value - 1 or p_announced_value > v_value + 1 then
    raise exception 'invalid_announcement';
  elsif p_announced_value < 2 then
    raise exception 'invalid_announcement';
  end if;

  v_truth := p_announced_value = v_value;
  update public.dead21_player_states
  set hand = jsonb_build_array(v_kept),
      pending_draw = null,
      played = played || jsonb_build_array(v_played || jsonb_build_object('announcedValue', p_announced_value, 'truth', v_truth)),
      score = score + v_value,
      turn_count = turn_count + 1
  where room_id = p_room_id and user_id = v_uid;

  v_state := jsonb_set(v_state, '{lastPlay}', jsonb_build_object(
    'playerId', v_uid::text,
    'cardId', p_played_card_id,
    'announcedValue', p_announced_value,
    'revealed', false
  ), true);
  v_state := jsonb_set(v_state, '{announcement}', to_jsonb(coalesce(v_state -> 'names' ->> v_uid::text, 'Joueur') || ' annonce ' || p_announced_value || '.'), true);
  v_state := jsonb_set(v_state, array['announcedScores', v_uid::text], to_jsonb(coalesce((v_state -> 'announcedScores' ->> v_uid::text)::integer, 0) + p_announced_value), true);
  v_state := public.dead21_after_action_internal(p_room_id, v_state);

  update public.rooms
  set settings = jsonb_set(settings, '{liars,state}', v_state, true)
  where id = p_room_id;
end;
$$;

create or replace function public.dead21_stay_rpc(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_state jsonb;
  v_private public.dead21_player_states;
  v_current_id text;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select settings #> '{liars,state}' into v_state
  from public.rooms
  where id = p_room_id and game = 'liars' and status = 'playing'
  for update;

  if v_state is null or v_state ->> 'mode' <> 'dead21' then raise exception 'not_dead21'; end if;
  if v_state ->> 'phase' <> 'playing' then raise exception 'phase_blocked'; end if;
  v_current_id := v_state -> 'order' ->> coalesce((v_state ->> 'currentIndex')::integer, 0);
  if v_current_id is distinct from v_uid::text then raise exception 'wrong_turn'; end if;

  select * into v_private
  from public.dead21_player_states
  where room_id = p_room_id and user_id = v_uid
  for update;

  if not found or v_private.eliminated or v_private.stayed then raise exception 'invalid_player'; end if;
  if v_private.turn_count <= 0 then raise exception 'stay_forbidden_first_turn'; end if;

  update public.dead21_player_states
  set stayed = true,
      hand = '[]'::jsonb,
      pending_draw = null
  where room_id = p_room_id and user_id = v_uid;

  v_state := jsonb_set(v_state, '{announcement}', to_jsonb(coalesce(v_state -> 'names' ->> v_uid::text, 'Joueur') || ' reste à ' || v_private.score || '.'), true);
  v_state := jsonb_set(v_state, '{lastPlay}', 'null'::jsonb, true);
  v_state := public.dead21_after_action_internal(p_room_id, v_state);

  update public.rooms
  set settings = jsonb_set(settings, '{liars,state}', v_state, true)
  where id = p_room_id;
end;
$$;

create or replace function public.dead21_accuse_rpc(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_state jsonb;
  v_current_id text;
  v_last jsonb;
  v_accused uuid;
  v_card_id text;
  v_card jsonb;
  v_truth boolean;
  v_shooter uuid;
  v_result jsonb;
  v_shot jsonb;
  v_alive_count integer;
  v_winner text;
  v_reveal_id text := extract(epoch from clock_timestamp())::text;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select settings #> '{liars,state}' into v_state
  from public.rooms
  where id = p_room_id and game = 'liars' and status = 'playing'
  for update;

  if v_state is null or v_state ->> 'mode' <> 'dead21' then raise exception 'not_dead21'; end if;
  if v_state ->> 'phase' <> 'playing' then raise exception 'phase_blocked'; end if;
  v_current_id := v_state -> 'order' ->> coalesce((v_state ->> 'currentIndex')::integer, 0);
  if v_current_id is distinct from v_uid::text then raise exception 'wrong_turn'; end if;

  v_last := v_state -> 'lastPlay';
  if v_last is null or v_last = 'null'::jsonb or coalesce((v_last ->> 'revealed')::boolean, false) then
    raise exception 'no_valid_accusation';
  end if;

  v_accused := (v_last ->> 'playerId')::uuid;
  v_card_id := v_last ->> 'cardId';

  if exists (
    select 1 from public.dead21_player_states
    where room_id = p_room_id
    and user_id = v_accused
    and (eliminated or stayed)
  ) then
    raise exception 'accused_unavailable';
  end if;

  select value into v_card
  from public.dead21_player_states ps,
       jsonb_array_elements(ps.played) value
  where ps.room_id = p_room_id
  and ps.user_id = v_accused
  and value ->> 'id' = v_card_id
  limit 1;

  if v_card is null then raise exception 'card_not_found'; end if;

  v_truth := coalesce((v_card ->> 'truth')::boolean, false);
  v_shooter := case when v_truth then v_uid else v_accused end;
  v_result := public.dead21_apply_shot(p_room_id, v_state, v_shooter);
  v_state := v_result -> 'state';
  v_shot := v_result -> 'shot';

  if not v_truth then
    v_state := public.dead21_award_state_reward(p_room_id, v_state, 'accuse_success', v_uid, 'accuse-' || v_reveal_id);
  end if;

  select count(*), min(user_id::text)
  into v_alive_count, v_winner
  from public.dead21_player_states
  where room_id = p_room_id
  and not eliminated;

  v_state := v_state || public.dead21_public_maps(p_room_id);
  v_state := jsonb_set(v_state, '{lastPlay}', jsonb_set(v_last, '{revealed}', 'true'::jsonb, true), true);
  v_state := jsonb_set(v_state, '{phase}', case when v_alive_count <= 1 then '"game_over"'::jsonb else '"reveal"'::jsonb end, true);
  v_state := jsonb_set(v_state, '{reveal}', jsonb_build_object(
    'id', v_reveal_id,
    'type', 'accuse',
    'accuserId', v_uid::text,
    'accusedId', v_accused::text,
    'card', v_card,
    'truth', v_truth,
    'shot', v_shot
  ), true);
  v_state := jsonb_set(v_state, '{announcement}', to_jsonb(case when v_truth then 'Accusation ratée.' else 'Mensonge révélé.' end), true);

  if v_alive_count <= 1 then
    v_state := public.dead21_award_game_end_rewards(p_room_id, v_state, 'game-end-' || v_reveal_id);
    v_state := jsonb_set(v_state, '{winner}', coalesce(to_jsonb(v_winner), 'null'::jsonb), true);
  end if;

  v_state := jsonb_set(v_state, '{version}', to_jsonb(coalesce((v_state ->> 'version')::integer, 0) + 1), true);

  update public.rooms
  set settings = jsonb_set(settings, '{liars,state}', v_state, true)
  where id = p_room_id;
end;
$$;

create or replace function public.dead21_finalize_reveal_rpc(
  p_room_id uuid,
  p_reveal_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
  v_next jsonb;
begin
  if (select auth.uid()) is null then raise exception 'not_authenticated'; end if;

  select settings #> '{liars,state}' into v_state
  from public.rooms
  where id = p_room_id and game = 'liars' and status = 'playing'
  for update;

  if v_state is null or v_state ->> 'mode' <> 'dead21' then raise exception 'not_dead21'; end if;
  if v_state -> 'reveal' ->> 'id' is distinct from p_reveal_id then return; end if;
  if v_state ->> 'phase' = 'game_over' then return; end if;

  v_next := public.dead21_start_round_internal(p_room_id, v_state);

  update public.rooms
  set settings = jsonb_set(settings, '{liars,state}', v_next, true)
  where id = p_room_id;
end;
$$;

create or replace function public.dead21_finalize_deck_intro_rpc(
  p_room_id uuid,
  p_intro_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
begin
  if (select auth.uid()) is null then raise exception 'not_authenticated'; end if;

  select settings #> '{liars,state}' into v_state
  from public.rooms
  where id = p_room_id and game = 'liars' and status = 'playing'
  for update;

  if v_state is null or v_state ->> 'mode' <> 'dead21' then raise exception 'not_dead21'; end if;
  if v_state ->> 'phase' <> 'deck_intro' then return; end if;
  if v_state -> 'deckIntro' ->> 'id' is distinct from p_intro_id then return; end if;

  v_state := jsonb_set(v_state, '{phase}', '"playing"'::jsonb, true);
  v_state := jsonb_set(v_state, '{deckIntro}', 'null'::jsonb, true);
  v_state := jsonb_set(v_state, '{announcement}', '"Nouvelle manche Dead 21."'::jsonb, true);
  v_state := jsonb_set(v_state, '{version}', to_jsonb(coalesce((v_state ->> 'version')::integer, 0) + 1), true);

  update public.rooms
  set settings = jsonb_set(settings, '{liars,state}', v_state, true)
  where id = p_room_id;
end;
$$;

create or replace function public.shop_weapon_price(p_skin_id text)
returns integer
language sql
immutable
as $$
  select case p_skin_id
    when 'revolverbois' then 500
    when 'revolvernerf' then 1500
    when 'revolverlego' then 1500
    when 'revolverog' then 2000
    when 'revolverreaver' then 2000
    when 'revolvercasino' then 3000
    when 'revolvergod' then 3000
    when 'revolvergold' then 4000
    when 'revolverdiamant' then 5000
    when 'revolverwali' then 1000
    when 'revolvernelson' then 1000
    when 'revolvermarmol' then 1000
    when 'revolversacha' then 1000
    when 'revolverjules' then 1000
    when 'revolversael' then 1000
    when 'revolverlouis' then 1000
    when 'revolvervial' then 1000
    when 'revolvertoma' then 1000
    else null
  end;
$$;

create or replace function public.shop_name_price(p_skin_id text)
returns integer
language sql
immutable
as $$
  select case p_skin_id
    when 'blue' then 1500
    when 'red' then 1500
    when 'green' then 1500
    when 'vert' then 1500
    when 'purple' then 1500
    when 'violet' then 1500
    when 'rgb' then 4000
    when 'gold' then 5000
    else null
  end;
$$;

create or replace function public.shop_death_price(p_skin_id text)
returns integer
language sql
immutable
as $$
  select case p_skin_id
    when 'mortjules' then 500
    when 'mortlouis' then 500
    when 'mortmarmol' then 500
    when 'mortnelson' then 500
    when 'mortsacha' then 500
    when 'mortsael' then 500
    when 'mortthomas' then 500
    when 'mortvial' then 500
    else null
  end;
$$;

create or replace function public.buy_shop_item_rpc(
  p_kind text,
  p_skin_id text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_price integer;
  v_profile public.profiles;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if p_kind = 'weapon' then
    v_price := public.shop_weapon_price(p_skin_id);
  elsif p_kind = 'name' then
    v_price := public.shop_name_price(p_skin_id);
  elsif p_kind = 'death' then
    v_price := public.shop_death_price(p_skin_id);
  else
    raise exception 'invalid_shop_kind';
  end if;

  if v_price is null then
    raise exception 'invalid_shop_item';
  end if;

  select * into v_profile
  from public.profiles
  where public.profiles.id = v_uid
  for update;

  if not found then
    raise exception 'profile_not_found';
  end if;

  if p_kind = 'weapon' and p_skin_id = any(v_profile.owned_weapon_skins) then
    return v_profile;
  end if;

  if p_kind = 'name' and p_skin_id = any(v_profile.owned_name_skins) then
    return v_profile;
  end if;

  if p_kind = 'death' and p_skin_id = any(v_profile.owned_death_skins) then
    return v_profile;
  end if;

  if v_profile.coins < v_price then
    raise exception 'not_enough_coins';
  end if;

  if p_kind = 'weapon' then
    update public.profiles
    set coins = coins - v_price,
        owned_weapon_skins = array_append(owned_weapon_skins, p_skin_id)
    where public.profiles.id = v_uid
    returning * into v_profile;
  elsif p_kind = 'name' then
    update public.profiles
    set coins = coins - v_price,
        owned_name_skins = array_append(owned_name_skins, p_skin_id)
    where public.profiles.id = v_uid
    returning * into v_profile;
  else
    update public.profiles
    set coins = coins - v_price,
        owned_death_skins = array_append(owned_death_skins, p_skin_id)
    where public.profiles.id = v_uid
    returning * into v_profile;
  end if;

  return v_profile;
end;
$$;

create or replace function public.equip_shop_item_rpc(
  p_kind text,
  p_skin_id text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_profile public.profiles;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_profile
  from public.profiles
  where public.profiles.id = v_uid
  for update;

  if not found then
    raise exception 'profile_not_found';
  end if;

  if p_kind = 'weapon' then
    if p_skin_id is not null and not (p_skin_id = any(v_profile.owned_weapon_skins)) then
      raise exception 'skin_not_owned';
    end if;
    update public.profiles
    set equipped_weapon_skin = p_skin_id
    where public.profiles.id = v_uid
    returning * into v_profile;
  elsif p_kind = 'name' then
    if p_skin_id is not null and not (p_skin_id = any(v_profile.owned_name_skins)) then
      raise exception 'skin_not_owned';
    end if;
    update public.profiles
    set equipped_name_skin = p_skin_id
    where public.profiles.id = v_uid
    returning * into v_profile;
  elsif p_kind = 'death' then
    if p_skin_id is not null and not (p_skin_id = any(v_profile.owned_death_skins)) then
      raise exception 'skin_not_owned';
    end if;
    update public.profiles
    set equipped_death_skin = p_skin_id
    where public.profiles.id = v_uid
    returning * into v_profile;
  else
    raise exception 'invalid_shop_kind';
  end if;

  update public.room_players
  set weapon_skin = v_profile.equipped_weapon_skin,
      name_skin = v_profile.equipped_name_skin,
      death_skin = v_profile.equipped_death_skin
  where user_id = v_uid;

  return v_profile;
end;
$$;

create or replace function public.sell_shop_item_rpc(
  p_kind text,
  p_skin_id text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_price integer;
  v_refund integer;
  v_profile public.profiles;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if p_kind = 'weapon' then
    v_price := public.shop_weapon_price(p_skin_id);
  elsif p_kind = 'name' then
    v_price := public.shop_name_price(p_skin_id);
  elsif p_kind = 'death' then
    v_price := public.shop_death_price(p_skin_id);
  else
    raise exception 'invalid_shop_kind';
  end if;

  if v_price is null or v_price > 1000 or v_price <= 0 then
    raise exception 'skin_not_sellable';
  end if;
  v_refund := floor(v_price / 2);

  select * into v_profile
  from public.profiles
  where public.profiles.id = v_uid
  for update;

  if not found then
    raise exception 'profile_not_found';
  end if;

  if p_kind = 'weapon' then
    if not (p_skin_id = any(v_profile.owned_weapon_skins)) then raise exception 'skin_not_owned'; end if;
    update public.profiles
    set coins = coins + v_refund,
        owned_weapon_skins = array_remove(owned_weapon_skins, p_skin_id),
        equipped_weapon_skin = case when equipped_weapon_skin = p_skin_id then null else equipped_weapon_skin end
    where id = v_uid returning * into v_profile;
  elsif p_kind = 'name' then
    if not (p_skin_id = any(v_profile.owned_name_skins)) then raise exception 'skin_not_owned'; end if;
    update public.profiles
    set coins = coins + v_refund,
        owned_name_skins = array_remove(owned_name_skins, p_skin_id),
        equipped_name_skin = case when equipped_name_skin = p_skin_id then null else equipped_name_skin end
    where id = v_uid returning * into v_profile;
  else
    if not (p_skin_id = any(v_profile.owned_death_skins)) then raise exception 'skin_not_owned'; end if;
    update public.profiles
    set coins = coins + v_refund,
        owned_death_skins = array_remove(owned_death_skins, p_skin_id),
        equipped_death_skin = case when equipped_death_skin = p_skin_id then null else equipped_death_skin end
    where id = v_uid returning * into v_profile;
  end if;

  update public.room_players
  set weapon_skin = v_profile.equipped_weapon_skin,
      name_skin = v_profile.equipped_name_skin,
      death_skin = v_profile.equipped_death_skin
  where user_id = v_uid;

  return v_profile;
end;
$$;

create or replace function public.get_dark_market_state_rpc()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_now timestamp with time zone := clock_timestamp();
  v_local time := (clock_timestamp() at time zone 'Europe/Paris')::time;
  v_open boolean;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  v_open := v_local >= time '22:00' or v_local < time '05:00';
  return jsonb_build_object(
    'open', v_open,
    'serverTime', v_now,
    'timezone', 'Europe/Paris',
    'opensAt', '22:00',
    'closesAt', '05:00',
    'products', '[]'::jsonb
  );
end;
$$;

create or replace function public.blackjack_random_card()
returns jsonb
language plpgsql
volatile
as $$
declare
  v_ranks text[] := array['2','3','4','5','6','7','8','9','10','Valet','Dame','Roi','As'];
  v_files text[];
  v_rank text;
  v_file_index integer;
  v_suit text;
  v_value integer;
  v_file text;
begin
  v_rank := v_ranks[1 + floor(random() * array_length(v_ranks, 1))::integer];
  v_value := case when v_rank in ('Valet', 'Dame', 'Roi') then 10 when v_rank = 'As' then 11 else v_rank::integer end;
  v_files := case v_rank
    when '2' then array['deuxpique.png','deuxcoeur.png']
    when '3' then array['troistrefle.png','troiscarreau.png']
    when '4' then array['quatrepique.png','quatrecoeur.png']
    when '5' then array['cinqtrefle.png','cinqcarreau.png']
    when '6' then array['sixpique.png','sixcoeur.png']
    when '7' then array['septtrefle.png','septcarreau.png']
    when '8' then array['huitpique.png','huitcoeur.png']
    when '9' then array['neuftrefle.png','neufcarreau.png']
    when '10' then array['dixpique.png','dixcoeur.png']
    when 'Valet' then array['valetpique.png','valetcoeur.png','valettrefle.png','valetcarreau.png']
    when 'Dame' then array['damepique.png','damecoeur.png','dametrefle.png','damecarreau.png']
    when 'Roi' then array['roipique.png','roicoeur.png','roitrefle.png','roicarreau.png']
    else array['aspique.png','ascoeur.png','astrefle.png','ascarreau.png']
  end;
  v_file_index := 1 + floor(random() * array_length(v_files, 1))::integer;
  v_file := v_files[v_file_index];
  v_suit := case
    when v_file like '%pique.png' then 'pique'
    when v_file like '%coeur.png' then 'coeur'
    when v_file like '%trefle.png' then 'trefle'
    else 'carreau'
  end;
  return jsonb_build_object('rank', v_rank, 'label', v_rank, 'suit', v_suit, 'value', v_value, 'image', v_file);
end;
$$;

create or replace function public.blackjack_card_value(p_card jsonb)
returns integer
language sql
immutable
as $$
  select case
    when p_card ->> 'rank' = 'As' then 11
    when p_card ->> 'rank' in ('Valet', 'Dame', 'Roi') then 10
    else greatest(0, coalesce((p_card ->> 'value')::integer, 0))
  end;
$$;

create or replace function public.blackjack_hand_score(p_cards jsonb)
returns integer
language plpgsql
immutable
as $$
declare
  v_total integer := 0;
  v_aces integer := 0;
  v_card jsonb;
begin
  for v_card in select value from jsonb_array_elements(coalesce(p_cards, '[]'::jsonb)) loop
    if v_card ->> 'rank' = 'As' then
      v_aces := v_aces + 1;
      v_total := v_total + 11;
    else
      v_total := v_total + public.blackjack_card_value(v_card);
    end if;
  end loop;
  while v_total > 21 and v_aces > 0 loop
    v_total := v_total - 10;
    v_aces := v_aces - 1;
  end loop;
  return v_total;
end;
$$;

create or replace function public.blackjack_hand_json(p_cards jsonb, p_status text default null)
returns jsonb
language plpgsql
immutable
as $$
declare
  v_score integer := public.blackjack_hand_score(p_cards);
  v_count integer := jsonb_array_length(coalesce(p_cards, '[]'::jsonb));
  v_status text := p_status;
begin
  if v_status is null then
    if v_score > 21 then v_status := 'bust';
    elsif v_score = 21 and v_count = 2 then v_status := 'blackjack';
    else v_status := 'playing';
    end if;
  end if;
  return jsonb_build_object('cards', coalesce(p_cards, '[]'::jsonb), 'score', v_score, 'status', v_status);
end;
$$;

create or replace function public.blackjack_sync_public_state(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state public.blackjack_room_states;
  v_players jsonb;
  v_names jsonb;
  v_name_skins jsonb;
  v_dealer_cards jsonb := '[]'::jsonb;
  v_dealer_public jsonb;
  v_current_hand jsonb;
  v_current_cards jsonb;
  v_can_split boolean := false;
  v_can_double boolean := false;
  v_room_settings jsonb;
begin
  select * into v_state from public.blackjack_room_states where room_id = p_room_id;
  if v_state.room_id is null then return; end if;

  select coalesce(jsonb_agg(user_id::text order by joined_at), '[]'::jsonb),
         coalesce(jsonb_object_agg(user_id::text, pseudo), '{}'::jsonb),
         coalesce(jsonb_object_agg(user_id::text, name_skin), '{}'::jsonb)
  into v_players, v_names, v_name_skins
  from public.room_players
  where room_id = p_room_id;

  if v_state.phase in ('dealer', 'settled', 'finished') then
    v_dealer_cards := v_state.dealer_hand;
  elsif jsonb_array_length(v_state.dealer_hand) > 0 then
    v_dealer_cards := jsonb_build_array(v_state.dealer_hand -> 0);
    if jsonb_array_length(v_state.dealer_hand) > 1 then
      v_dealer_cards := v_dealer_cards || jsonb_build_array(jsonb_build_object('hidden', true));
    end if;
  end if;
  v_dealer_public := public.blackjack_hand_json(v_dealer_cards, case when v_state.phase in ('dealer','settled','finished') then null else 'hidden' end);

  if v_state.current_player is not null then
    v_current_hand := v_state.player_hands #> array[v_state.current_player::text, v_state.active_hand::text];
    v_current_cards := coalesce(v_current_hand -> 'cards', '[]'::jsonb);
    v_can_double := jsonb_array_length(v_current_cards) = 2;
    v_can_split := jsonb_array_length(v_current_cards) = 2
      and public.blackjack_card_value(v_current_cards -> 0) = public.blackjack_card_value(v_current_cards -> 1)
      and jsonb_array_length(coalesce(v_state.player_hands -> v_state.current_player::text, '[]'::jsonb)) = 1
      and coalesce(v_state.hand_flags -> v_state.current_player::text, '{}'::jsonb) = '{}'::jsonb;
  end if;

  select settings into v_room_settings from public.rooms where id = p_room_id;
  v_room_settings := jsonb_set(coalesce(v_room_settings, '{}'::jsonb), '{blackjack,state}', jsonb_build_object(
    'gameId', v_state.round_id,
    'phase', v_state.phase,
    'players', v_players,
    'names', v_names,
    'nameSkins', v_name_skins,
    'bets', v_state.bets,
    'handBets', v_state.hand_bets,
    'hands', v_state.player_hands,
    'dealer', v_dealer_public,
    'currentPlayerId', coalesce(v_state.current_player::text, ''),
    'activeHand', v_state.active_hand,
    'results', v_state.results,
    'availableActions', jsonb_build_object('hit', true, 'stand', true, 'double', v_can_double, 'split', v_can_split)
  ), true);

  update public.rooms set settings = v_room_settings where id = p_room_id;
end;
$$;

create or replace function public.blackjack_finish_round(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state public.blackjack_room_states;
  v_dealer_score integer;
  v_player text;
  v_hands jsonb;
  v_hand jsonb;
  v_hand_flags jsonb;
  v_hand_results jsonb;
  v_hand_count integer;
  v_hand_idx integer;
  v_hand_score integer;
  v_bet integer;
  v_net integer;
  v_total_bet integer;
  v_player_net integer;
  v_player_payout integer;
  v_outcome text;
  v_primary_outcome text;
  v_results jsonb := '{}'::jsonb;
  v_profile public.profiles;
  v_stats jsonb;
  v_mode_stats jsonb;
  v_is_natural boolean;
  v_natural_count integer;
  v_bust_count integer;
  v_double_wins integer;
  v_split_wins integer;
  v_current_win_streak integer;
  v_current_loss_streak integer;
  v_best_win_streak integer;
  v_worst_loss_streak integer;
  v_best_win integer;
  v_worst_loss integer;
  v_max_bet integer;
  v_event jsonb;
begin
  select * into v_state from public.blackjack_room_states where room_id = p_room_id for update;
  if v_state.room_id is null then raise exception 'blackjack_not_started'; end if;
  if v_state.phase = 'settled' then
    perform public.blackjack_sync_public_state(p_room_id);
    return;
  end if;

  while public.blackjack_hand_score(v_state.dealer_hand) < 17 loop
    v_state.dealer_hand := v_state.dealer_hand || jsonb_build_array(public.blackjack_random_card());
  end loop;
  v_dealer_score := public.blackjack_hand_score(v_state.dealer_hand);

  for v_player in select jsonb_object_keys(v_state.player_hands) loop
    v_hands := coalesce(v_state.player_hands -> v_player, '[]'::jsonb);
    v_hand_count := jsonb_array_length(v_hands);
    v_hand_results := '[]'::jsonb;
    v_total_bet := 0;
    v_player_net := 0;
    v_player_payout := 0;
    v_natural_count := 0;
    v_bust_count := 0;
    v_double_wins := 0;
    v_split_wins := 0;
    v_primary_outcome := 'lose';

    for v_hand_idx in 0..greatest(0, v_hand_count - 1) loop
      v_hand := v_hands -> v_hand_idx;
      v_hand_flags := coalesce(v_state.hand_flags #> array[v_player, v_hand_idx::text], '{}'::jsonb);
      v_hand_score := public.blackjack_hand_score(v_hand -> 'cards');
      v_bet := coalesce((v_state.hand_bets #>> array[v_player, v_hand_idx::text])::integer, (v_state.bets ->> v_player)::integer, 0);
      v_total_bet := v_total_bet + v_bet;
      v_is_natural := v_hand_score = 21 and jsonb_array_length(v_hand -> 'cards') = 2 and v_hand_count = 1;

      if v_hand_score > 21 then
        v_outcome := 'bust'; v_net := -v_bet; v_bust_count := v_bust_count + 1;
      elsif v_is_natural and not (v_dealer_score = 21 and jsonb_array_length(v_state.dealer_hand) = 2) then
        v_outcome := 'blackjack'; v_net := floor(v_bet * 1.5)::integer; v_natural_count := v_natural_count + 1;
      elsif v_dealer_score > 21 or v_hand_score > v_dealer_score then
        v_outcome := 'win'; v_net := v_bet;
      elsif v_hand_score = v_dealer_score then
        v_outcome := 'push'; v_net := 0;
      else
        v_outcome := 'lose'; v_net := -v_bet;
      end if;

      if coalesce((v_hand_flags ->> 'doubled')::boolean, false) and v_outcome in ('win', 'blackjack') then
        v_double_wins := v_double_wins + 1;
      end if;
      if coalesce((v_hand_flags ->> 'split')::boolean, false) and v_outcome in ('win', 'blackjack') then
        v_split_wins := v_split_wins + 1;
      end if;

      v_player_net := v_player_net + v_net;
      v_player_payout := v_player_payout + case when v_net > 0 then v_bet + v_net when v_net = 0 then v_bet else 0 end;
      v_hand_results := v_hand_results || jsonb_build_array(jsonb_build_object('hand', v_hand_idx, 'outcome', v_outcome, 'net', v_net, 'payout', greatest(v_net, 0), 'score', v_hand_score, 'bet', v_bet));
    end loop;

    if v_player_payout > 0 then
      update public.profiles
      set coins = coins + v_player_payout,
          total_coins_earned = total_coins_earned + greatest(v_player_net, 0)
      where id = v_player::uuid
      returning * into v_profile;
    end if;

    if v_natural_count > 0 then v_primary_outcome := 'blackjack';
    elsif v_player_net > 0 then v_primary_outcome := 'win';
    elsif v_player_net = 0 then v_primary_outcome := 'push';
    elsif v_bust_count >= v_hand_count then v_primary_outcome := 'bust';
    else v_primary_outcome := 'lose';
    end if;

    v_results := jsonb_set(v_results, array[v_player], jsonb_build_object(
      'outcome', v_primary_outcome,
      'net', v_player_net,
      'payout', greatest(v_player_net, 0),
      'score', case when v_hand_count = 1 then public.blackjack_hand_score(((v_hands -> 0) -> 'cards')) else null end,
      'hands', v_hand_results
    ), true);

    v_stats := jsonb_build_object(
      'gamesPlayed', 1,
      'gamesWon', case when v_player_net > 0 then 1 else 0 end,
      'gamesLost', case when v_player_net < 0 then 1 else 0 end,
      'pushes', case when v_player_net = 0 then 1 else 0 end,
      'coinsBet', v_total_bet,
      'coinsWon', greatest(v_player_net, 0),
      'naturalBlackjacks', v_natural_count,
      'busts', v_bust_count,
      'doubleWins', v_double_wins,
      'splitWins', v_split_wins
    );
    insert into public.liars_profile_stats (user_id, mode, stats)
    values (v_player::uuid, 'blackjack', v_stats)
    on conflict (user_id, mode) do update
    set stats = public.liars_jsonb_add(public.liars_profile_stats.stats, excluded.stats),
        updated_at = now();

    select stats into v_mode_stats from public.liars_profile_stats where user_id = v_player::uuid and mode = 'blackjack';
    v_best_win := greatest(coalesce((v_mode_stats ->> 'bestWin')::integer, 0), greatest(v_player_net, 0));
    v_worst_loss := greatest(coalesce((v_mode_stats ->> 'worstLoss')::integer, 0), greatest(-v_player_net, 0));
    v_max_bet := greatest(coalesce((v_mode_stats ->> 'maxBet')::integer, 0), v_total_bet);
    v_current_win_streak := case when v_player_net > 0 then coalesce((v_mode_stats ->> 'currentWinStreak')::integer, 0) + 1 else 0 end;
    v_current_loss_streak := case when v_player_net < 0 then coalesce((v_mode_stats ->> 'currentLossStreak')::integer, 0) + 1 else 0 end;
    v_best_win_streak := greatest(coalesce((v_mode_stats ->> 'bestWinStreak')::integer, 0), v_current_win_streak);
    v_worst_loss_streak := greatest(coalesce((v_mode_stats ->> 'worstLossStreak')::integer, 0), v_current_loss_streak);
    update public.liars_profile_stats
    set stats = jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(stats, '{bestWin}', to_jsonb(v_best_win), true),
              '{worstLoss}', to_jsonb(v_worst_loss), true
            ),
            '{maxBet}', to_jsonb(v_max_bet), true
          ),
          '{currentWinStreak}', to_jsonb(v_current_win_streak), true
        ),
        '{currentLossStreak}', to_jsonb(v_current_loss_streak), true
      ),
      '{bestWinStreak}', to_jsonb(v_best_win_streak), true
    )
    where user_id = v_player::uuid and mode = 'blackjack';
    update public.liars_profile_stats
    set stats = jsonb_set(stats, '{worstLossStreak}', to_jsonb(v_worst_loss_streak), true)
    where user_id = v_player::uuid and mode = 'blackjack';

    insert into public.liars_profile_stats (user_id, mode, stats)
    values (v_player::uuid, 'global', jsonb_build_object('gamesPlayed', 1, 'gamesWon', case when v_player_net > 0 then 1 else 0 end))
    on conflict (user_id, mode) do update
    set stats = public.liars_jsonb_add(public.liars_profile_stats.stats, excluded.stats),
        updated_at = now();

    if v_total_bet >= 1000 then v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_state.round_id, 'miseurfou', 'blackjack', v_total_bet); end if;
    if v_natural_count > 0 then v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_state.round_id, 'mainroyale', 'blackjack', 1); end if;
    if v_double_wins > 0 then v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_state.round_id, 'doubleourien', 'blackjack', 1); end if;
    if v_current_loss_streak >= 3 then v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_state.round_id, 'rpflorian', 'blackjack', v_current_loss_streak); end if;
    if v_current_win_streak >= 5 then v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_state.round_id, 'croupierhumilie', 'blackjack', v_current_win_streak); end if;
  end loop;

  update public.blackjack_room_states
  set phase = 'settled',
      dealer_hand = v_state.dealer_hand,
      results = v_results,
      current_player = null,
      updated_at = now()
  where room_id = p_room_id;
  perform public.blackjack_sync_public_state(p_room_id);
end;
$$;

create or replace function public.start_blackjack_room_rpc(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_room public.rooms;
  v_count integer;
  v_round text := extract(epoch from clock_timestamp())::text;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_room from public.rooms where id = p_room_id for update;
  if v_room.id is null then raise exception 'room_not_found'; end if;
  if v_room.host_id <> v_uid then raise exception 'not_room_host'; end if;
  if v_room.game <> 'blackjack' then raise exception 'invalid_game'; end if;
  select count(*) into v_count from public.room_players where room_id = p_room_id;
  if v_count < 1 or v_count > 4 then raise exception 'blackjack_requires_1_to_4_players'; end if;

  insert into public.blackjack_room_states (room_id, phase, round_id, dealer_hand, player_hands, bets, hand_bets, hand_flags, results, current_player, active_hand)
  values (p_room_id, 'betting', v_round, '[]'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, null, 0)
  on conflict (room_id) do update
  set phase = 'betting',
      round_id = excluded.round_id,
      dealer_hand = '[]'::jsonb,
      player_hands = '{}'::jsonb,
      bets = '{}'::jsonb,
      hand_bets = '{}'::jsonb,
      hand_flags = '{}'::jsonb,
      results = '{}'::jsonb,
      current_player = null,
      active_hand = 0,
      updated_at = now();

  perform public.blackjack_sync_public_state(p_room_id);
  select * into v_room from public.rooms where id = p_room_id;
  return v_room.settings #> '{blackjack,state}';
end;
$$;

create or replace function public.blackjack_place_bet_rpc(p_room_id uuid, p_amount integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_state public.blackjack_room_states;
  v_profile public.profiles;
  v_total integer;
  v_bet_count integer;
  v_player record;
  v_hands jsonb := '{}'::jsonb;
  v_hand_bets jsonb := '{}'::jsonb;
  v_current uuid;
  v_room public.rooms;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_amount < 50 then raise exception 'invalid_bet'; end if;
  if not exists (select 1 from public.room_players where room_id = p_room_id and user_id = v_uid) then raise exception 'not_room_player'; end if;
  select * into v_state from public.blackjack_room_states where room_id = p_room_id for update;
  if v_state.room_id is null or v_state.phase <> 'betting' then raise exception 'phase_blocked'; end if;
  if v_state.bets ? v_uid::text then raise exception 'bet_already_placed'; end if;

  select * into v_profile from public.profiles where id = v_uid for update;
  if v_profile.coins < p_amount then raise exception 'not_enough_coins'; end if;
  update public.profiles set coins = coins - p_amount where id = v_uid returning * into v_profile;

  v_state.bets := jsonb_set(v_state.bets, array[v_uid::text], to_jsonb(p_amount), true);
  update public.blackjack_room_states set bets = v_state.bets, updated_at = now() where room_id = p_room_id;

  select count(*) into v_total from public.room_players where room_id = p_room_id;
  select count(*) into v_bet_count from jsonb_object_keys(v_state.bets);
  if v_bet_count >= v_total then
    for v_player in select user_id from public.room_players where room_id = p_room_id order by joined_at loop
      v_hands := jsonb_set(v_hands, array[v_player.user_id::text], jsonb_build_array(public.blackjack_hand_json(jsonb_build_array(public.blackjack_random_card(), public.blackjack_random_card()))), true);
      v_hand_bets := jsonb_set(v_hand_bets, array[v_player.user_id::text], jsonb_build_object('0', v_state.bets -> v_player.user_id::text), true);
      if v_current is null and ((v_hands #> array[v_player.user_id::text, '0']) ->> 'status') = 'playing' then
        v_current := v_player.user_id;
      end if;
    end loop;
    update public.blackjack_room_states
    set phase = case when v_current is null then 'dealer' else 'playing' end,
        dealer_hand = jsonb_build_array(public.blackjack_random_card(), public.blackjack_random_card()),
        player_hands = v_hands,
        hand_bets = v_hand_bets,
        current_player = v_current,
        active_hand = 0,
        updated_at = now()
    where room_id = p_room_id;
    if v_current is null then perform public.blackjack_finish_round(p_room_id); else perform public.blackjack_sync_public_state(p_room_id); end if;
  else
    perform public.blackjack_sync_public_state(p_room_id);
  end if;
  select * into v_room from public.rooms where id = p_room_id;
  return jsonb_build_object('profile', to_jsonb(v_profile), 'state', v_room.settings #> '{blackjack,state}');
end;
$$;

create or replace function public.blackjack_advance_turn(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state public.blackjack_room_states;
  v_players uuid[];
  v_idx integer;
  v_hand_idx integer;
  v_id uuid;
  v_hands jsonb;
  v_hand jsonb;
begin
  select * into v_state from public.blackjack_room_states where room_id = p_room_id for update;
  select array_agg(user_id order by joined_at) into v_players from public.room_players where room_id = p_room_id;
  for v_idx in 1..coalesce(array_length(v_players, 1), 0) loop
    v_id := v_players[v_idx];
    v_hands := v_state.player_hands -> v_id::text;
    for v_hand_idx in 0..greatest(0, jsonb_array_length(coalesce(v_hands, '[]'::jsonb)) - 1) loop
      v_hand := v_hands -> v_hand_idx;
      if (v_hand ->> 'status') = 'playing' then
        update public.blackjack_room_states
        set phase = 'playing', current_player = v_id, active_hand = v_hand_idx, updated_at = now()
        where room_id = p_room_id;
        perform public.blackjack_sync_public_state(p_room_id);
        return;
      end if;
    end loop;
  end loop;
  update public.blackjack_room_states set phase = 'dealer', current_player = null, updated_at = now() where room_id = p_room_id;
  perform public.blackjack_finish_round(p_room_id);
end;
$$;

create or replace function public.blackjack_hit_rpc(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_state public.blackjack_room_states;
  v_path text[];
  v_hand jsonb;
  v_cards jsonb;
  v_room public.rooms;
begin
  select * into v_state from public.blackjack_room_states where room_id = p_room_id for update;
  if v_state.phase <> 'playing' or v_state.current_player <> v_uid then raise exception 'wrong_turn'; end if;
  v_path := array[v_uid::text, v_state.active_hand::text];
  v_hand := v_state.player_hands #> v_path;
  v_cards := coalesce(v_hand -> 'cards', '[]'::jsonb) || jsonb_build_array(public.blackjack_random_card());
  v_hand := public.blackjack_hand_json(v_cards, null);
  v_state.player_hands := jsonb_set(v_state.player_hands, v_path, v_hand, false);
  update public.blackjack_room_states set player_hands = v_state.player_hands, updated_at = now() where room_id = p_room_id;
  if (v_hand ->> 'status') <> 'playing' then perform public.blackjack_advance_turn(p_room_id); else perform public.blackjack_sync_public_state(p_room_id); end if;
  select * into v_room from public.rooms where id = p_room_id;
  return v_room.settings #> '{blackjack,state}';
end;
$$;

create or replace function public.blackjack_stand_rpc(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_state public.blackjack_room_states;
  v_path text[];
  v_hand jsonb;
  v_room public.rooms;
begin
  select * into v_state from public.blackjack_room_states where room_id = p_room_id for update;
  if v_state.phase <> 'playing' or v_state.current_player <> v_uid then raise exception 'wrong_turn'; end if;
  v_path := array[v_uid::text, v_state.active_hand::text];
  v_hand := v_state.player_hands #> v_path;
  v_hand := jsonb_set(v_hand, '{status}', '"stand"', true);
  update public.blackjack_room_states set player_hands = jsonb_set(v_state.player_hands, v_path, v_hand, false), updated_at = now() where room_id = p_room_id;
  perform public.blackjack_advance_turn(p_room_id);
  select * into v_room from public.rooms where id = p_room_id;
  return v_room.settings #> '{blackjack,state}';
end;
$$;

create or replace function public.blackjack_double_rpc(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_state public.blackjack_room_states;
  v_path text[];
  v_hand jsonb;
  v_cards jsonb;
  v_bet integer;
  v_profile public.profiles;
  v_room public.rooms;
begin
  select * into v_state from public.blackjack_room_states where room_id = p_room_id for update;
  if v_state.phase <> 'playing' or v_state.current_player <> v_uid then raise exception 'wrong_turn'; end if;
  v_path := array[v_uid::text, v_state.active_hand::text];
  v_hand := v_state.player_hands #> v_path;
  v_cards := coalesce(v_hand -> 'cards', '[]'::jsonb);
  if jsonb_array_length(v_cards) <> 2 then raise exception 'double_not_allowed'; end if;
  v_bet := coalesce((v_state.hand_bets #>> v_path)::integer, 0);
  select * into v_profile from public.profiles where id = v_uid for update;
  if v_profile.coins < v_bet then raise exception 'not_enough_coins'; end if;
  update public.profiles set coins = coins - v_bet where id = v_uid returning * into v_profile;
  v_cards := v_cards || jsonb_build_array(public.blackjack_random_card());
  v_hand := public.blackjack_hand_json(v_cards, case when public.blackjack_hand_score(v_cards) > 21 then 'bust' else 'stand' end);
  v_state.player_hands := jsonb_set(v_state.player_hands, v_path, v_hand, false);
  v_state.hand_bets := jsonb_set(v_state.hand_bets, v_path, to_jsonb(v_bet * 2), false);
  v_state.bets := jsonb_set(v_state.bets, array[v_uid::text], to_jsonb(coalesce((v_state.bets ->> v_uid::text)::integer, 0) + v_bet), true);
  if not (v_state.hand_flags ? v_uid::text) then
    v_state.hand_flags := jsonb_set(v_state.hand_flags, array[v_uid::text], '{}'::jsonb, true);
  end if;
  v_state.hand_flags := jsonb_set(v_state.hand_flags, v_path, jsonb_build_object('doubled', true), true);
  update public.blackjack_room_states set player_hands = v_state.player_hands, bets = v_state.bets, hand_bets = v_state.hand_bets, hand_flags = v_state.hand_flags, updated_at = now() where room_id = p_room_id;
  perform public.blackjack_advance_turn(p_room_id);
  select * into v_room from public.rooms where id = p_room_id;
  return jsonb_build_object('profile', to_jsonb(v_profile), 'state', v_room.settings #> '{blackjack,state}');
end;
$$;

create or replace function public.blackjack_split_rpc(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_state public.blackjack_room_states;
  v_path text[];
  v_hand jsonb;
  v_cards jsonb;
  v_bet integer;
  v_profile public.profiles;
  v_new_hands jsonb;
  v_room public.rooms;
begin
  select * into v_state from public.blackjack_room_states where room_id = p_room_id for update;
  if v_state.phase <> 'playing' or v_state.current_player <> v_uid or v_state.active_hand <> 0 then raise exception 'wrong_turn'; end if;
  v_path := array[v_uid::text, '0'];
  v_hand := v_state.player_hands #> v_path;
  v_cards := coalesce(v_hand -> 'cards', '[]'::jsonb);
  if jsonb_array_length(coalesce(v_state.player_hands -> v_uid::text, '[]'::jsonb)) <> 1
     or coalesce(v_state.hand_flags -> v_uid::text, '{}'::jsonb) <> '{}'::jsonb then
    raise exception 'split_not_allowed';
  end if;
  if jsonb_array_length(v_cards) <> 2 or public.blackjack_card_value(v_cards -> 0) <> public.blackjack_card_value(v_cards -> 1) then raise exception 'split_not_allowed'; end if;
  v_bet := coalesce((v_state.hand_bets #>> v_path)::integer, 0);
  select * into v_profile from public.profiles where id = v_uid for update;
  if v_profile.coins < v_bet then raise exception 'not_enough_coins'; end if;
  update public.profiles set coins = coins - v_bet where id = v_uid returning * into v_profile;
  v_new_hands := jsonb_build_array(
    public.blackjack_hand_json(jsonb_build_array(v_cards -> 0, public.blackjack_random_card())),
    public.blackjack_hand_json(jsonb_build_array(v_cards -> 1, public.blackjack_random_card()))
  );
  v_state.player_hands := jsonb_set(v_state.player_hands, array[v_uid::text], v_new_hands, false);
  v_state.hand_bets := jsonb_set(jsonb_set(v_state.hand_bets, array[v_uid::text, '0'], to_jsonb(v_bet), true), array[v_uid::text, '1'], to_jsonb(v_bet), true);
  v_state.hand_flags := jsonb_set(v_state.hand_flags, array[v_uid::text], jsonb_build_object('0', jsonb_build_object('split', true), '1', jsonb_build_object('split', true)), true);
  update public.blackjack_room_states set player_hands = v_state.player_hands, hand_bets = v_state.hand_bets, hand_flags = v_state.hand_flags, updated_at = now() where room_id = p_room_id;
  perform public.blackjack_sync_public_state(p_room_id);
  select * into v_room from public.rooms where id = p_room_id;
  return jsonb_build_object('profile', to_jsonb(v_profile), 'state', v_room.settings #> '{blackjack,state}');
end;
$$;

create or replace function public.blackjack_finalize_round_rpc(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms;
begin
  if (select auth.uid()) is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.room_players where room_id = p_room_id and user_id = (select auth.uid())) then raise exception 'not_room_player'; end if;
  if not exists (select 1 from public.blackjack_room_states where room_id = p_room_id and phase in ('dealer', 'settled')) then raise exception 'phase_blocked'; end if;
  perform public.blackjack_finish_round(p_room_id);
  select * into v_room from public.rooms where id = p_room_id;
  return v_room.settings #> '{blackjack,state}';
end;
$$;

create or replace function public.get_blackjack_private_state_rpc(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.room_players where room_id = p_room_id and user_id = (select auth.uid())) then raise exception 'not_room_player'; end if;
  return '{}'::jsonb;
end;
$$;

create or replace function public.get_lucky_wheel_state_rpc()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_profile public.profiles;
  v_now timestamp with time zone := clock_timestamp();
  v_next timestamp with time zone;
  v_cooldown_seconds integer := 0;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_profile
  from public.profiles
  where id = v_uid
  for update;

  if not found then
    raise exception 'profile_not_found';
  end if;

  v_next := case
    when v_profile.last_lucky_wheel_spin_at is null then null
    else v_profile.last_lucky_wheel_spin_at + interval '3 hours'
  end;

  if v_next is not null and v_next > v_now and coalesce(v_profile.lucky_wheel_bonus_spins, 0) <= 0 then
    v_cooldown_seconds := ceil(extract(epoch from (v_next - v_now)))::integer;
  end if;

  return jsonb_build_object(
    'serverNow', v_now,
    'canSpin', coalesce(v_profile.lucky_wheel_bonus_spins, 0) > 0 or v_next is null or v_next <= v_now,
    'cooldownSeconds', greatest(0, v_cooldown_seconds),
    'bonusSpins', coalesce(v_profile.lucky_wheel_bonus_spins, 0),
    'nextAvailableAt', v_next,
    'profile', to_jsonb(v_profile)
  );
end;
$$;

create or replace function public.spin_lucky_wheel_rpc()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_profile public.profiles;
  v_now timestamp with time zone := clock_timestamp();
  v_next timestamp with time zone;
  v_roll numeric;
  v_reward_id text;
  v_label text;
  v_coins integer := 0;
  v_skin_id text := null;
  v_bonus boolean := false;
  v_was_bonus boolean := false;
  v_state jsonb;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_profile
  from public.profiles
  where id = v_uid
  for update;

  if not found then
    raise exception 'profile_not_found';
  end if;

  v_was_bonus := coalesce(v_profile.lucky_wheel_bonus_spins, 0) > 0;
  v_next := case
    when v_profile.last_lucky_wheel_spin_at is null then null
    else v_profile.last_lucky_wheel_spin_at + interval '3 hours'
  end;

  if not v_was_bonus and v_next is not null and v_next > v_now then
    raise exception 'wheel_cooldown';
  end if;

  v_roll := random() * 100;
  if v_roll < 5 then
    v_reward_id := 'coins_1';
  elsif v_roll < 25 then
    v_reward_id := 'coins_100';
  elsif v_roll < 30 then
    v_reward_id := 'bonus_spin';
  elsif v_roll < 63 then
    v_reward_id := 'coins_200';
  elsif v_roll < 83 then
    v_reward_id := 'coins_300';
  elsif v_roll < 93 then
    v_reward_id := 'coins_500';
  elsif v_roll < 98 then
    v_reward_id := 'coins_1000';
  else
    v_reward_id := 'casino_skin';
  end if;

  if v_was_bonus and v_reward_id = 'bonus_spin' then
    v_reward_id := 'coins_500';
  end if;

  v_label := case v_reward_id
    when 'coins_1' then '1 pièce'
    when 'coins_100' then '100 pièces'
    when 'bonus_spin' then 'Relancer la roue'
    when 'coins_200' then '200 pièces'
    when 'coins_300' then '300 pièces'
    when 'coins_500' then '500 pièces'
    when 'coins_1000' then '1000 pièces'
    when 'casino_skin' then 'Skin casino'
    else 'Bonus'
  end;

  v_coins := case v_reward_id
    when 'coins_1' then 1
    when 'coins_100' then 100
    when 'coins_200' then 200
    when 'coins_300' then 300
    when 'coins_500' then 500
    when 'coins_1000' then 1000
    else 0
  end;

  v_bonus := v_reward_id = 'bonus_spin';

  if v_reward_id = 'casino_skin' then
    v_skin_id := 'revolvercasino';
    if v_skin_id = any(v_profile.owned_weapon_skins) then
      v_coins := 0;
      v_label := '0 pièce';
      v_reward_id := 'casino_duplicate';
      v_skin_id := null;
    end if;
  end if;

  if v_was_bonus then
    update public.profiles
    set lucky_wheel_bonus_spins = greatest(0, lucky_wheel_bonus_spins - 1),
        last_lucky_wheel_spin_at = v_now,
        coins = coins + v_coins,
        owned_weapon_skins = case
          when v_skin_id is not null and not (v_skin_id = any(owned_weapon_skins)) then array_append(owned_weapon_skins, v_skin_id)
          else owned_weapon_skins
        end
    where id = v_uid
    returning * into v_profile;
  elsif v_bonus then
    update public.profiles
    set lucky_wheel_bonus_spins = lucky_wheel_bonus_spins + 1
    where id = v_uid
    returning * into v_profile;
  else
    update public.profiles
    set last_lucky_wheel_spin_at = v_now,
        coins = coins + v_coins,
        owned_weapon_skins = case
          when v_skin_id is not null and not (v_skin_id = any(owned_weapon_skins)) then array_append(owned_weapon_skins, v_skin_id)
          else owned_weapon_skins
        end
    where id = v_uid
    returning * into v_profile;
  end if;

  insert into public.lucky_wheel_history (user_id, reward_id, reward_label, coins, skin_id, was_bonus)
  values (v_uid, v_reward_id, v_label, v_coins, v_skin_id, v_was_bonus);

  v_state := public.get_lucky_wheel_state_rpc();

  return jsonb_build_object(
    'rewardId', v_reward_id,
    'label', v_label,
    'coins', v_coins,
    'skinId', v_skin_id,
    'bonusSpin', v_bonus,
    'wasBonus', v_was_bonus,
    'profile', to_jsonb(v_profile),
    'state', v_state
  );
end;
$$;

create or replace function public.award_liars_reward_rpc(
  p_room_id uuid,
  p_game_id text,
  p_reward_type text,
  p_reward_key text,
  p_rewarded_user_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount integer;
  v_initial_count integer;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1 from public.room_players
    where room_id = p_room_id
    and user_id = (select auth.uid())
  ) then
    raise exception 'not_room_player';
  end if;

  if not exists (
    select 1 from public.room_players
    where room_id = p_room_id
    and user_id = p_rewarded_user_id
  ) then
    raise exception 'rewarded_user_not_in_room';
  end if;

  select coalesce((settings #>> '{liars,state,initialPlayerCount}')::integer, 0)
  into v_initial_count
  from public.rooms
  where id = p_room_id;

  v_amount := case p_reward_type
    when 'accuse_success' then 50
    when 'bluff_success' then 50
    when 'winner' then case when v_initial_count >= 6 then 300 when v_initial_count = 5 then 200 else 100 end
    when 'second_place' then case when v_initial_count >= 6 then 200 when v_initial_count = 5 then 100 else 50 end
    when 'third_place' then case when v_initial_count >= 6 then 100 when v_initial_count = 5 then 50 else 0 end
    when 'round_survivor' then 50
    else null
  end;

  if v_amount is null then
    raise exception 'invalid_reward_type';
  end if;

  insert into public.coin_rewards (room_id, game_id, user_id, reward_type, reward_key, amount)
  values (p_room_id, p_game_id, p_rewarded_user_id, p_reward_type, p_reward_key, v_amount)
  on conflict (reward_key) do nothing;

  if found then
    update public.profiles
    set coins = coins + v_amount
    where public.profiles.id = p_rewarded_user_id;
    return v_amount;
  end if;

  return 0;
end;
$$;

create or replace function public.liars_jsonb_add(
  p_base jsonb,
  p_patch jsonb
)
returns jsonb
language plpgsql
immutable
as $$
declare
  v_result jsonb := coalesce(p_base, '{}'::jsonb);
  v_key text;
  v_value jsonb;
  v_existing numeric;
  v_next numeric;
begin
  for v_key, v_value in select key, value from jsonb_each(coalesce(p_patch, '{}'::jsonb))
  loop
    if jsonb_typeof(v_value) = 'number' then
      v_existing := coalesce((v_result ->> v_key)::numeric, 0);
      v_next := v_existing + (v_value::text)::numeric;
      v_result := jsonb_set(v_result, array[v_key], to_jsonb(v_next), true);
    else
      v_result := jsonb_set(v_result, array[v_key], v_value, true);
    end if;
  end loop;
  return v_result;
end;
$$;

create or replace function public.unlock_liars_badge_internal(
  p_user_id uuid,
  p_room_id uuid,
  p_game_id text,
  p_badge_id text,
  p_category text,
  p_progress integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.liars_player_badges;
  v_event jsonb := null;
begin
  if p_user_id is null or p_badge_id is null or p_category is null then
    return null;
  end if;

  select * into v_existing
  from public.liars_player_badges
  where user_id = p_user_id
  and badge_id = p_badge_id;

  if v_existing.user_id is null then
    insert into public.liars_player_badges (user_id, badge_id, category, state, progress, unlocked_at)
    values (p_user_id, p_badge_id, p_category, 'COMPLETED_UNCLAIMED', greatest(1, coalesce(p_progress, 1)), now());
    v_event := jsonb_build_object('badgeId', p_badge_id, 'category', p_category);
  elsif v_existing.state = 'LOCKED' then
    update public.liars_player_badges
    set state = 'COMPLETED_UNCLAIMED',
        progress = greatest(progress, greatest(1, coalesce(p_progress, 1))),
        unlocked_at = coalesce(unlocked_at, now()),
        updated_at = now()
    where user_id = p_user_id
    and badge_id = p_badge_id;
    v_event := jsonb_build_object('badgeId', p_badge_id, 'category', p_category);
  else
    update public.liars_player_badges
    set progress = greatest(progress, greatest(1, coalesce(p_progress, 1))),
        updated_at = now()
    where user_id = p_user_id
    and badge_id = p_badge_id;
  end if;

  if v_event is not null then
    insert into public.liars_badge_unlock_events (user_id, room_id, game_id, badge_id)
    values (p_user_id, p_room_id, p_game_id, p_badge_id)
    on conflict do nothing;
  end if;

  return v_event;
end;
$$;

create or replace function public.get_liars_profile_rpc(
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_profile jsonb;
  v_stats jsonb;
  v_badges jsonb;
  v_rewards jsonb;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select to_jsonb(p) into v_profile
  from public.profiles p
  where p.id = p_user_id;

  if v_profile is null then
    raise exception 'profile_not_found';
  end if;

  select coalesce(jsonb_object_agg(mode, stats), '{}'::jsonb)
  into v_stats
  from public.liars_profile_stats
  where user_id = p_user_id;

  select coalesce(jsonb_object_agg(badge_id, jsonb_build_object(
    'state', state,
    'progress', progress,
    'unlocked_at', unlocked_at,
    'claimed_at', claimed_at
  )), '{}'::jsonb)
  into v_badges
  from public.liars_player_badges
  where user_id = p_user_id;

  select coalesce(jsonb_object_agg(category, jsonb_build_object(
    'coins', coins,
    'claimed_at', claimed_at
  )), '{}'::jsonb)
  into v_rewards
  from public.liars_badge_category_rewards
  where user_id = p_user_id;

  return jsonb_build_object(
    'profile', v_profile,
    'stats', coalesce(v_stats, '{}'::jsonb),
    'badges', coalesce(v_badges, '{}'::jsonb),
    'badgeRewards', coalesce(v_rewards, '{}'::jsonb),
    'isSelf', p_user_id = v_uid
  );
end;
$$;

create or replace function public.claim_liars_badge_rpc(
  p_badge_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_profile jsonb;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  update public.liars_player_badges
  set state = 'CLAIMED',
      claimed_at = now(),
      updated_at = now()
  where user_id = v_uid
  and badge_id = p_badge_id
  and state = 'COMPLETED_UNCLAIMED';

  if not found then
    raise exception 'badge_not_claimable';
  end if;

  select to_jsonb(p) into v_profile from public.profiles p where p.id = v_uid;
  return jsonb_build_object('profile', v_profile);
end;
$$;

create or replace function public.claim_liars_badge_category_reward_rpc(
  p_category text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_required text[];
  v_reward integer;
  v_profile jsonb;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if p_category = 'roulette' then
    v_required := array['miracule','immortel','tetebrullee','chanceinsolente','allin','pokerface','sherlock','menteurpro','intouchable','roidubluff'];
    v_reward := 2000;
  elsif p_category = 'chaos' then
    v_required := array['demoniste','apocalyptique','tireurdelite','cowboy','westernhardcore','derniersouffle','faibledesprit','chaosabsolu','professionel','maitredujeu'];
    v_reward := 3000;
  elsif p_category = 'blackjack' then
    v_required := array['miseurfou','rpflorian','mainroyale','doubleourien','croupierhumilie'];
    v_reward := 2000;
  else
    raise exception 'invalid_category';
  end if;

  if exists (
    select 1
    from unnest(v_required) as required_badge(badge_id)
    left join public.liars_player_badges b
      on b.user_id = v_uid
      and b.badge_id = required_badge.badge_id
      and b.state = 'CLAIMED'
    where b.badge_id is null
  ) then
    raise exception 'category_not_complete';
  end if;

  insert into public.liars_badge_category_rewards (user_id, category, coins)
  values (v_uid, p_category, v_reward)
  on conflict do nothing;

  if not found then
    raise exception 'reward_already_claimed';
  end if;

  update public.profiles
  set coins = coins + v_reward,
      total_coins_earned = coalesce(total_coins_earned, 0) + v_reward
  where id = v_uid;

  select to_jsonb(p) into v_profile from public.profiles p where p.id = v_uid;
  return jsonb_build_object('profile', v_profile, 'coins', v_reward);
end;
$$;

create or replace function public.reset_liars_profile_stats_rpc()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_profile jsonb;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  delete from public.liars_profile_stats
  where user_id = v_uid;

  update public.profiles
  set liars_xp = 0,
      liars_level = 1,
      current_win_streak = 0,
      best_win_streak = 0,
      total_coins_earned = 0
  where id = v_uid
  returning to_jsonb(public.profiles.*) into v_profile;

  return jsonb_build_object('profile', v_profile);
end;
$$;

create or replace function public.finalize_liars_game_stats_rpc(
  p_room_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_room public.rooms;
  v_state jsonb;
  v_game_id text;
  v_mode text;
  v_participants text[];
  v_player text;
  v_winner text;
  v_second text;
  v_third text;
  v_delta jsonb;
  v_badge_delta jsonb;
  v_all_stats jsonb;
  v_new_badges jsonb := '[]'::jsonb;
  v_event jsonb;
  v_profile_patch jsonb;
  v_accuse_ok integer;
  v_accuse_wrong integer;
  v_xp integer;
  v_coins integer;
  v_level integer;
  v_total_xp integer;
  v_next integer;
  v_participant_count integer;
  v_forfeit_count integer;
  v_profile jsonb;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_room
  from public.rooms
  where id = p_room_id
  and game = 'liars';

  if v_room.id is null then
    raise exception 'room_not_found';
  end if;

  if not exists (
    select 1 from public.room_players
    where room_id = p_room_id
    and user_id = v_uid
  ) and v_room.host_id <> v_uid then
    raise exception 'not_room_player';
  end if;

  v_state := v_room.settings #> '{liars,state}';
  v_game_id := coalesce(v_state ->> 'gameId', p_room_id::text);
  v_mode := coalesce(v_state ->> 'mode', v_room.settings #>> '{liars,mode}', 'normal');
  if v_mode not in ('normal', 'roulette', 'chaos', 'dead21') then
    v_mode := 'normal';
  end if;

  if v_state is null or (nullif(v_state ->> 'winner', '') is null and coalesce(v_state ->> 'phase', '') <> 'game_over') then
    raise exception 'game_not_finished';
  end if;

  insert into public.liars_game_stat_claims (room_id, game_id)
  values (p_room_id, v_game_id)
  on conflict do nothing;

  if not found then
    select to_jsonb(p) into v_profile from public.profiles p where p.id = v_uid;
    return jsonb_build_object('alreadyFinalized', true, 'profile', v_profile, 'newlyUnlockedBadges', '[]'::jsonb);
  end if;

  select coalesce(array_agg(value), '{}') into v_participants
  from jsonb_array_elements_text(coalesce(v_state -> 'order', '[]'::jsonb)) as e(value);
  v_participant_count := coalesce(array_length(v_participants, 1), 0);
  select count(*) into v_forfeit_count
  from jsonb_array_elements_text(coalesce(v_state -> 'forfeitedPlayers', '[]'::jsonb)) as e(value);

  if v_participant_count < 2 or v_forfeit_count > 0 then
    select to_jsonb(p) into v_profile from public.profiles p where p.id = v_uid;
    return jsonb_build_object('ignored', true, 'profile', v_profile, 'newlyUnlockedBadges', '[]'::jsonb);
  end if;

  v_winner := nullif(v_state ->> 'winner', '');
  select value into v_second
  from jsonb_array_elements_text(coalesce(v_state -> 'eliminationOrder', '[]'::jsonb)) with ordinality as e(value, ord)
  where value <> coalesce(v_winner, '')
  order by ord desc
  limit 1;

  select value into v_third
  from jsonb_array_elements_text(coalesce(v_state -> 'eliminationOrder', '[]'::jsonb)) with ordinality as e(value, ord)
  where value <> coalesce(v_winner, '') and value <> coalesce(v_second, '')
  order by ord desc
  limit 1;

  foreach v_player in array v_participants
  loop
    v_delta := coalesce(v_state #> array['profileStats', v_player], '{}'::jsonb);
    v_badge_delta := coalesce(v_state #> array['badgeStats', v_player], '{}'::jsonb);
    v_accuse_ok := coalesce((v_state #>> array['stats', v_player, 'accuseOk'])::integer, 0);
    v_accuse_wrong := coalesce((v_state #>> array['stats', v_player, 'accuseWrong'])::integer, 0);
    if v_accuse_ok > 0 then
      v_delta := public.liars_jsonb_add(v_delta, jsonb_build_object('accuseOk', v_accuse_ok));
    end if;
    if v_accuse_wrong > 0 then
      v_delta := public.liars_jsonb_add(v_delta, jsonb_build_object('accuseWrong', v_accuse_wrong));
    end if;

    v_delta := public.liars_jsonb_add(v_delta, jsonb_build_object('gamesPlayed', 1));
    if v_player = v_winner then
      v_delta := public.liars_jsonb_add(v_delta, jsonb_build_object('gamesWon', 1));
    end if;
    if v_player = v_second then
      v_delta := public.liars_jsonb_add(v_delta, jsonb_build_object('secondPlaces', 1));
    end if;
    if v_player = v_third then
      v_delta := public.liars_jsonb_add(v_delta, jsonb_build_object('thirdPlaces', 1));
    end if;
    if v_participant_count >= 3 and v_player = v_winner and v_second is not null then
      v_delta := public.liars_jsonb_add(v_delta, jsonb_build_object('duels1v1Won', 1));
    end if;

    v_xp := 0;
    if v_player = v_winner then v_xp := v_xp + 120; end if;
    if v_player = v_second then v_xp := v_xp + 70; end if;
    if v_player = v_third then v_xp := v_xp + 35; end if;
    if exists (select 1 from jsonb_array_elements_text(coalesce(v_state -> 'eliminationOrder', '[]'::jsonb)) e(value) where value = v_player) then
      v_xp := v_xp + 20;
    end if;
    v_xp := v_xp
      + coalesce((v_delta ->> 'accuseOk')::integer, 0) * 10
      + coalesce((v_delta ->> 'bluffsSuccessful')::integer, 0) * 10
      + coalesce((v_delta ->> 'rouletteSurvived')::integer, 0) * 15
      + coalesce((v_delta ->> 'rouletteDeaths')::integer, 0) * 5;

    v_coins := coalesce((v_state #>> array['coinRewards', v_player])::integer, 0);

    insert into public.liars_profile_stats (user_id, mode, stats)
    values (v_player::uuid, v_mode, v_delta)
    on conflict (user_id, mode) do update
    set stats = public.liars_jsonb_add(public.liars_profile_stats.stats, excluded.stats),
        updated_at = now();

    insert into public.liars_profile_stats (user_id, mode, stats)
    values (v_player::uuid, 'global', v_delta)
    on conflict (user_id, mode) do update
    set stats = public.liars_jsonb_add(public.liars_profile_stats.stats, excluded.stats),
        updated_at = now();

    select stats into v_all_stats
    from public.liars_profile_stats
    where user_id = v_player::uuid
    and mode = v_mode;
    v_all_stats := coalesce(v_all_stats, '{}'::jsonb);

    if v_mode = 'roulette' then
      if coalesce((v_badge_delta ->> 'maxRouletteSurvivalStreak')::integer, 0) >= 3 then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'miracule', 'roulette', coalesce((v_badge_delta ->> 'maxRouletteSurvivalStreak')::integer, 3));
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if coalesce((v_badge_delta ->> 'criticalSurvivals')::integer, 0) >= 1 then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'immortel', 'roulette', 1);
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if coalesce((v_all_stats ->> 'rouletteSurvived')::integer, 0) >= 25 then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'tetebrullee', 'roulette', coalesce((v_all_stats ->> 'rouletteSurvived')::integer, 25));
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if coalesce((v_all_stats ->> 'criticalSurvivals')::integer, 0) >= 5 then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'chanceinsolente', 'roulette', coalesce((v_all_stats ->> 'criticalSurvivals')::integer, 5));
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if coalesce((v_badge_delta ->> 'allIn')::boolean, false) then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'allin', 'roulette', 1);
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if v_player = v_winner and not coalesce((v_badge_delta ->> 'liedThisGame')::boolean, false) then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'pokerface', 'roulette', 1);
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if coalesce((v_badge_delta ->> 'maxAccuseStreak')::integer, 0) >= 5 then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'sherlock', 'roulette', coalesce((v_badge_delta ->> 'maxAccuseStreak')::integer, 5));
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if coalesce((v_all_stats ->> 'bluffsSuccessful')::integer, 0) >= 50 then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'menteurpro', 'roulette', coalesce((v_all_stats ->> 'bluffsSuccessful')::integer, 50));
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if v_player = v_winner and not coalesce((v_badge_delta ->> 'accusedThisGame')::boolean, false) then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'intouchable', 'roulette', 1);
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if coalesce((v_badge_delta ->> 'maxBluffsSuccessfulThisGame')::integer, 0) >= 10 then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'roidubluff', 'roulette', coalesce((v_badge_delta ->> 'maxBluffsSuccessfulThisGame')::integer, 10));
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
    elsif v_mode = 'chaos' then
      if coalesce((v_badge_delta ->> 'demonKillsThisGame')::integer, 0) >= 2 then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'demoniste', 'chaos', coalesce((v_badge_delta ->> 'demonKillsThisGame')::integer, 2));
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if v_player = v_winner and coalesce((v_badge_delta ->> 'demonTriggeredThisGame')::boolean, false) then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'apocalyptique', 'chaos', 1);
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if coalesce((v_all_stats ->> 'hunterKills')::integer, 0) >= 5 then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'tireurdelite', 'chaos', coalesce((v_all_stats ->> 'hunterKills')::integer, 5));
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if coalesce((v_delta ->> 'farWestDuelsWon')::integer, 0) > 0 then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'cowboy', 'chaos', 1);
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if coalesce((v_badge_delta ->> 'farWestDuelSurvivedShotsMax')::integer, 0) >= 3 then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'westernhardcore', 'chaos', coalesce((v_badge_delta ->> 'farWestDuelSurvivedShotsMax')::integer, 3));
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if v_player = v_winner and coalesce((v_badge_delta ->> 'criticalSurvivedThisGame')::boolean, false) then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'derniersouffle', 'chaos', 1);
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if coalesce((v_badge_delta ->> 'diedRoundOne')::boolean, false) then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'faibledesprit', 'chaos', 1);
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if coalesce((v_badge_delta ->> 'chaosAllSpecialsAlive')::boolean, false) then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'chaosabsolu', 'chaos', 3);
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if v_player = v_winner and coalesce((v_badge_delta ->> 'dangerousBarrelWin')::boolean, false) then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'professionel', 'chaos', 1);
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
      if v_participant_count >= 4 and v_player = v_winner and coalesce((v_badge_delta ->> 'responsibleKills')::integer, 0) >= v_participant_count - 1 then
        v_event := public.unlock_liars_badge_internal(v_player::uuid, p_room_id, v_game_id, 'maitredujeu', 'chaos', coalesce((v_badge_delta ->> 'responsibleKills')::integer, 0));
        if v_event is not null and v_player::uuid = v_uid then v_new_badges := v_new_badges || jsonb_build_array(v_event); end if;
      end if;
    end if;

    select liars_level, liars_xp into v_level, v_total_xp
    from public.profiles
    where id = v_player::uuid;
    v_level := greatest(1, coalesce(v_level, 1));
    v_total_xp := coalesce(v_total_xp, 0) + v_xp;
    loop
      v_next := 100 + (v_level * v_level * 35);
      exit when v_total_xp < v_next;
      v_total_xp := v_total_xp - v_next;
      v_level := v_level + 1;
    end loop;

    update public.profiles
    set liars_level = v_level,
        liars_xp = v_total_xp,
        total_coins_earned = coalesce(total_coins_earned, 0) + greatest(0, v_coins),
        current_win_streak = case when v_player = v_winner then coalesce(current_win_streak, 0) + 1 else 0 end,
        best_win_streak = greatest(coalesce(best_win_streak, 0), case when v_player = v_winner then coalesce(current_win_streak, 0) + 1 else coalesce(current_win_streak, 0) end)
    where id = v_player::uuid;
  end loop;

  select to_jsonb(p) into v_profile from public.profiles p where p.id = v_uid;
  return jsonb_build_object('finalized', true, 'profile', v_profile, 'newlyUnlockedBadges', coalesce(v_new_badges, '[]'::jsonb));
end;
$$;

create or replace function public.check_liars_inactivity_rpc(
  p_room_id uuid,
  p_stale_after_seconds integer default 28
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_room public.rooms;
  v_anti_afk boolean;
  v_deleted uuid[] := '{}';
  v_prompts jsonb := '[]'::jsonb;
  v_player record;
  v_next_host uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_room from public.rooms where id = p_room_id;
  if v_room.id is null then raise exception 'room_not_found'; end if;

  if not exists (select 1 from public.room_players where room_id = p_room_id and user_id = v_uid) then
    raise exception 'not_room_player';
  end if;

  v_anti_afk := coalesce((v_room.settings #>> '{liars,antiAfkEnabled}')::boolean, true);

  if v_room.game <> 'liars' or v_anti_afk then
    with deleted as (
      delete from public.room_players
      where room_id = p_room_id
      and user_id <> v_uid
      and last_seen_at < now() - make_interval(secs => greatest(18, p_stale_after_seconds))
      and presence_device = 'mobile'
      returning user_id
    )
    select coalesce(array_agg(user_id), '{}') into v_deleted from deleted;

    if exists (select 1 from public.rooms where id = p_room_id and host_id = any(v_deleted)) then
      select user_id into v_next_host from public.room_players where room_id = p_room_id order by joined_at asc limit 1;
      if v_next_host is null then delete from public.rooms where id = p_room_id;
      else update public.rooms set host_id = v_next_host where id = p_room_id;
      end if;
    end if;

    return jsonb_build_object('deleted', coalesce(to_jsonb(v_deleted), '[]'::jsonb), 'prompts', '[]'::jsonb);
  end if;

  for v_player in
    select user_id, pseudo
    from public.room_players
    where room_id = p_room_id
    and user_id <> v_uid
    and last_seen_at < now() - interval '30 seconds'
    and presence_device = 'mobile'
  loop
    if not exists (
      select 1 from public.liars_afk_prompts
      where room_id = p_room_id
      and user_id = v_player.user_id
      and status = 'active'
    ) then
      insert into public.liars_afk_prompts (room_id, user_id, pseudo, next_check_at)
      values (p_room_id, v_player.user_id, v_player.pseudo, now() + interval '30 seconds');
    end if;
  end loop;

  if v_room.host_id = v_uid then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', id,
      'userId', user_id,
      'pseudo', pseudo,
      'nextCheckAt', next_check_at
    ) order by created_at asc), '[]'::jsonb)
    into v_prompts
    from public.liars_afk_prompts
    where room_id = p_room_id
    and status = 'active'
    and next_check_at <= now() + interval '30 seconds';
  end if;

  return jsonb_build_object('deleted', '[]'::jsonb, 'prompts', coalesce(v_prompts, '[]'::jsonb));
end;
$$;

create or replace function public.respond_liars_inactivity_rpc(
  p_room_id uuid,
  p_prompt_id uuid,
  p_target_user_id uuid,
  p_action text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (select 1 from public.rooms where id = p_room_id and host_id = v_uid) then
    raise exception 'not_room_host';
  end if;

  if p_action = 'kick' then
    delete from public.room_players
    where room_id = p_room_id
    and user_id = p_target_user_id;

    update public.liars_afk_prompts
    set status = 'resolved', updated_at = now()
    where id = p_prompt_id
    and room_id = p_room_id;
  elsif p_action = 'extend' then
    update public.liars_afk_prompts
    set next_check_at = now() + interval '60 seconds',
        updated_at = now()
    where id = p_prompt_id
    and room_id = p_room_id;
  else
    update public.liars_afk_prompts
    set next_check_at = now() + interval '30 seconds',
        updated_at = now()
    where id = p_prompt_id
    and room_id = p_room_id;
  end if;
end;
$$;

-- Explicit API permissions: internal helpers run only through the RPC owner.
do $permissions$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = any(array[
      'handle_new_user',
      'create_room_rpc',
      'join_room_rpc',
      'get_room_player_coins_rpc',
      'get_june_5_gift_state_rpc',
      'claim_june_5_gift_rpc',
      'update_room_settings_rpc',
      'start_room_rpc',
      'update_liars_state_rpc',
      'update_photo_state_rpc',
      'update_who_state_rpc',
      'update_who_vote_rpc',
      'update_true_state_rpc',
      'submit_true_entries_rpc',
      'submit_true_vote_rpc',
      'leave_room_rpc',
      'update_player_presence_rpc',
      'cleanup_stale_room_players_rpc',
      'cleanup_old_rooms_rpc',
      'dead21_card_value',
      'dead21_card_label',
      'dead21_card_images',
      'dead21_make_card',
      'dead21_build_deck',
      'dead21_public_maps',
      'dead21_start_round_internal',
      'start_dead21_room_rpc',
      'get_dead21_private_state_rpc',
      'dead21_award_state_reward',
      'dead21_award_game_end_rewards',
      'dead21_apply_shot',
      'dead21_finish_round_internal',
      'dead21_after_action_internal',
      'dead21_forfeit_player_rpc',
      'dead21_play_card_rpc',
      'dead21_draw_card_rpc',
      'dead21_play_draw_choice_rpc',
      'dead21_stay_rpc',
      'dead21_accuse_rpc',
      'dead21_finalize_reveal_rpc',
      'dead21_finalize_deck_intro_rpc',
      'shop_weapon_price',
      'shop_name_price',
      'shop_death_price',
      'buy_shop_item_rpc',
      'equip_shop_item_rpc',
      'sell_shop_item_rpc',
      'get_dark_market_state_rpc',
      'blackjack_random_card',
      'blackjack_card_value',
      'blackjack_hand_score',
      'blackjack_hand_json',
      'blackjack_sync_public_state',
      'blackjack_finish_round',
      'start_blackjack_room_rpc',
      'blackjack_place_bet_rpc',
      'blackjack_advance_turn',
      'blackjack_hit_rpc',
      'blackjack_stand_rpc',
      'blackjack_double_rpc',
      'blackjack_split_rpc',
      'blackjack_finalize_round_rpc',
      'get_blackjack_private_state_rpc',
      'get_lucky_wheel_state_rpc',
      'spin_lucky_wheel_rpc',
      'award_liars_reward_rpc',
      'liars_jsonb_add',
      'unlock_liars_badge_internal',
      'get_liars_profile_rpc',
      'claim_liars_badge_rpc',
      'claim_liars_badge_category_reward_rpc',
      'reset_liars_profile_stats_rpc',
      'finalize_liars_game_stats_rpc',
      'check_liars_inactivity_rpc',
      'respond_liars_inactivity_rpc'
    ])
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', fn.signature);
  end loop;
end;
$permissions$;

-- RLS still applies. Progression and inventory may only be changed by RPCs.
grant usage on schema public to authenticated;
grant select on public.profiles, public.rooms, public.room_players,
  public.lucky_wheel_history, public.liars_player_badges,
  public.liars_badge_category_rewards, public.liars_badge_unlock_events,
  public.dead21_player_states to authenticated;
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, pseudo), update (id, pseudo) on public.profiles to authenticated;
grant insert, update on public.rooms to authenticated;
grant update, delete on public.room_players to authenticated;
revoke insert on public.room_players from anon, authenticated;

grant execute on function public.create_room_rpc(text, text, text, jsonb) to authenticated;
grant execute on function public.join_room_rpc(uuid, text) to authenticated;
grant execute on function public.update_room_settings_rpc(uuid, jsonb) to authenticated;
grant execute on function public.update_liars_state_rpc(uuid, jsonb) to authenticated;
grant execute on function public.update_photo_state_rpc(uuid, jsonb) to authenticated;
grant execute on function public.update_who_state_rpc(uuid, jsonb) to authenticated;
grant execute on function public.update_who_vote_rpc(uuid, text) to authenticated;
grant execute on function public.update_true_state_rpc(uuid, jsonb) to authenticated;
grant execute on function public.submit_true_entries_rpc(uuid, text, text) to authenticated;
grant execute on function public.submit_true_vote_rpc(uuid, text, boolean) to authenticated;
grant execute on function public.start_room_rpc(uuid) to authenticated;
grant execute on function public.leave_room_rpc(uuid) to authenticated;
grant execute on function public.update_player_presence_rpc(uuid, text) to authenticated;
grant execute on function public.get_room_player_coins_rpc(uuid) to authenticated;
grant execute on function public.cleanup_stale_room_players_rpc(uuid, integer, boolean) to authenticated;
grant execute on function public.cleanup_old_rooms_rpc(integer, integer, integer) to authenticated;
grant execute on function public.get_liars_profile_rpc(uuid) to authenticated;
grant execute on function public.finalize_liars_game_stats_rpc(uuid) to authenticated;
grant execute on function public.claim_liars_badge_rpc(text) to authenticated;
grant execute on function public.claim_liars_badge_category_reward_rpc(text) to authenticated;
grant execute on function public.reset_liars_profile_stats_rpc() to authenticated;
grant execute on function public.check_liars_inactivity_rpc(uuid, integer) to authenticated;
grant execute on function public.respond_liars_inactivity_rpc(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.start_dead21_room_rpc(uuid) to authenticated;
grant execute on function public.get_dead21_private_state_rpc(uuid) to authenticated;
grant execute on function public.dead21_play_card_rpc(uuid, text, integer) to authenticated;
grant execute on function public.dead21_draw_card_rpc(uuid) to authenticated;
grant execute on function public.dead21_play_draw_choice_rpc(uuid, text, text, integer) to authenticated;
grant execute on function public.dead21_stay_rpc(uuid) to authenticated;
grant execute on function public.dead21_accuse_rpc(uuid) to authenticated;
grant execute on function public.dead21_forfeit_player_rpc(uuid, uuid) to authenticated;
grant execute on function public.dead21_finalize_reveal_rpc(uuid, text) to authenticated;
grant execute on function public.dead21_finalize_deck_intro_rpc(uuid, text) to authenticated;
grant execute on function public.buy_shop_item_rpc(text, text) to authenticated;
grant execute on function public.equip_shop_item_rpc(text, text) to authenticated;
grant execute on function public.sell_shop_item_rpc(text, text) to authenticated;
grant execute on function public.get_dark_market_state_rpc() to authenticated;
grant execute on function public.get_lucky_wheel_state_rpc() to authenticated;
grant execute on function public.spin_lucky_wheel_rpc() to authenticated;
grant execute on function public.get_june_5_gift_state_rpc() to authenticated;
grant execute on function public.claim_june_5_gift_rpc() to authenticated;
grant execute on function public.award_liars_reward_rpc(uuid, text, text, text, uuid) to authenticated;
grant execute on function public.start_blackjack_room_rpc(uuid) to authenticated;
grant execute on function public.blackjack_place_bet_rpc(uuid, integer) to authenticated;
grant execute on function public.blackjack_hit_rpc(uuid) to authenticated;
grant execute on function public.blackjack_stand_rpc(uuid) to authenticated;
grant execute on function public.blackjack_double_rpc(uuid) to authenticated;
grant execute on function public.blackjack_split_rpc(uuid) to authenticated;
grant execute on function public.blackjack_finalize_round_rpc(uuid) to authenticated;
grant execute on function public.get_blackjack_private_state_rpc(uuid) to authenticated;

insert into public.profiles (id, pseudo)
select
  auth.users.id,
  coalesce(nullif(auth.users.raw_user_meta_data ->> 'pseudo', ''), split_part(auth.users.email, '@', 1), 'Joueur')
from auth.users
on conflict (id) do update
set pseudo = excluded.pseudo;

notify pgrst, 'reload schema';
