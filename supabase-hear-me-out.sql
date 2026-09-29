-- Additive Hear Me Out setup. Run AFTER supabase-multiplayer-setup.sql.
-- No existing game data is deleted. Secrets never enter rooms.settings or Realtime.
begin;
create schema if not exists hmo_private;
revoke all on schema hmo_private from public, anon, authenticated;
grant usage on schema hmo_private to authenticated;

create table if not exists hmo_private.themes (
  name text primary key, search text not null
);
insert into hmo_private.themes values
 ('Jeux vidéo','video game character'),('Films','film character'),('Séries','television character'),
 ('Anime & manga','anime character'),('Dessins animés','cartoon character'),('Super-héros','superhero'),
 ('Méchants','villain'),('Fantasy','fantasy character'),('Créatures','mythological creature'),('Robots','robot'),
 ('Célébrités','portrait celebrity'),('Musique','musician portrait'),('Personnages historiques','historical portrait'),
 ('Personnages non humains','fictional creature'),('Personnages secondaires','supporting character'),
 ('Personnages masqués','masked character'),('Boss','video game boss'),('Choix improbables','fictional character')
on conflict (name) do nothing;

create table if not exists hmo_private.games (
 room_id uuid primary key references public.rooms(id) on delete cascade,
 mode text not null default 'common' check(mode in ('common','individual')),
 theme text not null default 'Jeux vidéo' references hmo_private.themes(name),
 choice_count integer not null default 3 check(choice_count between 1 and 7),
 phase text not null default 'setup' check(phase in ('setup','preparing','turn','defending','voting','result','finished')),
 turn_order uuid[] not null default '{}', turn_index integer not null default 1,
 revision bigint not null default 0
);
create table if not exists hmo_private.players (
 room_id uuid references hmo_private.games(room_id) on delete cascade,
 user_id uuid references auth.users(id) on delete cascade,
 theme text not null references hmo_private.themes(name), ready boolean not null default false,
 primary key(room_id,user_id)
);
create table if not exists hmo_private.choices (
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references hmo_private.games(room_id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 pseudo text not null, theme text not null, position integer not null,
 title text not null check(length(title) between 1 and 100),
 path text not null unique, thumb text not null unique,
 credit text not null default '' check(length(credit)<=1200),
 source text not null default '' check(length(source)<=1000),
 revealed boolean not null default false, result jsonb,
 unique(room_id,user_id,position)
);
create table if not exists hmo_private.votes (
 choice_id uuid references hmo_private.choices(id) on delete cascade,
 user_id uuid references auth.users(id) on delete cascade,
 vote text not null check(vote in ('yes','meh','no')), primary key(choice_id,user_id)
);
create index if not exists hmo_choices_room_revealed on hmo_private.choices(room_id,revealed);
create index if not exists hmo_votes_user on hmo_private.votes(user_id);
create table if not exists public.hmo_events (
 room_id uuid primary key references public.rooms(id) on delete cascade, revision bigint not null default 0
);
alter table public.hmo_events enable row level security;
alter table hmo_private.games enable row level security;
alter table hmo_private.players enable row level security;
alter table hmo_private.choices enable row level security;
alter table hmo_private.votes enable row level security;
alter table hmo_private.themes enable row level security;
revoke all on all tables in schema hmo_private from public,anon,authenticated;
revoke all on public.hmo_events from public,anon,authenticated;
grant select on public.hmo_events to authenticated;
drop policy if exists hmo_member_events on public.hmo_events;
create policy hmo_member_events on public.hmo_events for select to authenticated using (
 exists(select 1 from public.room_players p where p.room_id=hmo_events.room_id and p.user_id=(select auth.uid()))
);

-- The sole game API checks membership, serializes mutations and returns a redacted snapshot.
create or replace function hmo_private.dispatch(p_room_id uuid,p_action text,p_payload jsonb default '{}')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 u uuid := auth.uid(); r public.rooms; g hmo_private.games; c hmo_private.choices;
 p record; t text; n integer; changed boolean := false; can_edit boolean;
 cur uuid; counts jsonb; output jsonb; theme_pool text[];
begin
 if u is null then raise exception 'not_authenticated'; end if;
 select * into r from public.rooms where id=p_room_id for update;
 if r.id is null or r.game<>'hear' or not exists(select 1 from public.room_players where room_id=p_room_id and user_id=u)
 then raise exception 'not_member'; end if;
 if (select count(*) from public.room_players where room_id=p_room_id)>8 then raise exception 'maximum_8_players'; end if;
 insert into hmo_private.games(room_id) values(p_room_id) on conflict do nothing;
 insert into public.hmo_events(room_id) values(p_room_id) on conflict do nothing;
 select * into g from hmo_private.games where room_id=p_room_id for update;
 -- Assign new members distinct themes while the room is open. Never publish them.
 for p in select rp.user_id from public.room_players rp where rp.room_id=p_room_id
   and not exists(select 1 from hmo_private.players hp where hp.room_id=p_room_id and hp.user_id=rp.user_id)
 loop
   if g.phase not in ('setup','preparing') then raise exception 'game_started'; end if;
   select name into t from hmo_private.themes order by
     (exists(select 1 from hmo_private.players hp where hp.room_id=p_room_id and hp.theme=name)),random() limit 1;
   insert into hmo_private.players values(p_room_id,p.user_id,case when g.mode='common' then g.theme else t end,false);
   changed := true;
 end loop;
 can_edit := g.phase='preparing' and not (select ready from hmo_private.players where room_id=p_room_id and user_id=u);
 if p_action='prepare' then
   if r.host_id<>u or g.phase<>'setup' then raise exception 'host_setup_only'; end if;
   g.mode := p_payload->>'mode'; g.theme := p_payload->>'theme';
   g.choice_count := (p_payload->>'count')::integer;
   if g.mode is null or g.mode not in ('common','individual') or g.choice_count is null or g.choice_count not between 1 and 7
      or not exists(select 1 from hmo_private.themes where name=g.theme) then raise exception 'invalid_settings'; end if;
   -- Reassign all themes together, with no duplicates in individual mode (up to 8 players).
   select array_agg(name order by random()) into theme_pool from hmo_private.themes;
   n := 0;
   for p in select user_id from hmo_private.players where room_id=p_room_id order by random() loop
     t := theme_pool[n+1];
     update hmo_private.players set theme=case when g.mode='common' then g.theme else t end where room_id=p_room_id and user_id=p.user_id;
     n := n+1;
   end loop;
   g.phase := 'preparing'; changed := true;
 elsif p_action='add' then
   if not can_edit then raise exception 'selection_locked'; end if;
   if (select count(*) from hmo_private.choices where room_id=p_room_id and user_id=u)>=g.choice_count then raise exception 'selection_full'; end if;
   if coalesce(p_payload->>'path','') not like u::text||'/'||p_room_id::text||'/%'
      or coalesce(p_payload->>'thumb','') not like u::text||'/'||p_room_id::text||'/%'
      or p_payload->>'path'=p_payload->>'thumb'
      or not exists(select 1 from storage.objects where bucket_id='hear-me-out' and name=p_payload->>'path')
      or not exists(select 1 from storage.objects where bucket_id='hear-me-out' and name=p_payload->>'thumb') then raise exception 'invalid_image'; end if;
   insert into hmo_private.choices(room_id,user_id,pseudo,theme,position,title,path,thumb,credit,source)
   select p_room_id,u,rp.pseudo,hp.theme,
     coalesce((select max(position)+1 from hmo_private.choices where room_id=p_room_id and user_id=u),1),
     trim(p_payload->>'title'),p_payload->>'path',p_payload->>'thumb',coalesce(p_payload->>'credit',''),coalesce(p_payload->>'source','')
   from hmo_private.players hp join public.room_players rp using(room_id,user_id) where hp.room_id=p_room_id and hp.user_id=u;
   changed := true;
 elsif p_action='remove' then
   if not can_edit then raise exception 'selection_locked'; end if;
   delete from hmo_private.choices where room_id=p_room_id and user_id=u and id=(p_payload->>'id')::uuid;
   changed := found;
 elsif p_action='ready' then
   if g.phase<>'preparing' then raise exception 'selection_locked'; end if;
   if coalesce((p_payload->>'ready')::boolean,false) and
     (select count(*) from hmo_private.choices where room_id=p_room_id and user_id=u)<>g.choice_count then raise exception 'selection_incomplete'; end if;
   update hmo_private.players set ready=coalesce((p_payload->>'ready')::boolean,false) where room_id=p_room_id and user_id=u;
   changed := true;
 elsif p_action='start' then
   if u<>r.host_id or g.phase<>'preparing' then raise exception 'host_preparation_only'; end if;
   if (select count(*) from public.room_players where room_id=p_room_id)<2 or exists(
     select 1 from public.room_players rp join hmo_private.players hp using(room_id,user_id)
     where rp.room_id=p_room_id and (not hp.ready or
       (select count(*) from hmo_private.choices ch where ch.room_id=p_room_id and ch.user_id=rp.user_id)<>g.choice_count))
   then raise exception 'everyone_must_be_ready'; end if;
   select array_agg(ch.id order by ch.position, rp.joined_at,rp.user_id) into g.turn_order
     from hmo_private.choices ch join public.room_players rp using(room_id,user_id) where ch.room_id=p_room_id;
   g.phase := 'turn'; g.turn_index := 1; changed := true;
 elsif p_action not in ('get','reveal','open_vote','vote','next') then raise exception 'invalid_action';
 end if;
 cur := g.turn_order[g.turn_index];
 select * into c from hmo_private.choices where id=cur;
 if p_action in ('reveal','open_vote','next') then
   if u<>c.user_id and u<>r.host_id then raise exception 'not_your_turn'; end if;
   if p_action='reveal' then
     -- A host cannot reveal another present player's secret selection.
     if g.phase<>'turn' or u<>c.user_id then raise exception 'not_your_turn'; end if;
     update hmo_private.choices set revealed=true where id=cur;
     g.phase := 'defending';
   elsif p_action='open_vote' then
     if g.phase<>'defending' then raise exception 'wrong_phase'; end if;
     g.phase := 'voting';
   else
     if g.phase<>'result' then raise exception 'wrong_phase'; end if;
     g.turn_index := g.turn_index+1; g.phase := 'turn';
   end if;
   changed := true;
 elsif p_action='vote' then
   if g.phase<>'voting' or u=c.user_id then raise exception 'cannot_vote'; end if;
   -- Payload choice id prevents a delayed vote being applied to the next reveal.
   if (p_payload->>'id')::uuid is distinct from cur then raise exception 'stale_turn'; end if;
   insert into hmo_private.votes values(cur,u,p_payload->>'vote');
   changed := true;
 end if;
 -- Reconcile departures on every event/reconnection, including a departing author.
 if g.phase in ('defending','voting') and not exists(select 1 from public.room_players where room_id=p_room_id and user_id=c.user_id) then
   g.phase := 'voting'; changed := true;
 end if;
 if g.phase='voting' and not exists(
   select 1 from public.room_players rp where rp.room_id=p_room_id and rp.user_id<>c.user_id
   and not exists(select 1 from hmo_private.votes v where v.choice_id=cur and v.user_id=rp.user_id)
 ) then
   select jsonb_build_object('yes',count(*) filter(where vote='yes'),'meh',count(*) filter(where vote='meh'),'no',count(*) filter(where vote='no'))
     into counts from hmo_private.votes where choice_id=cur;
   update hmo_private.choices set result=counts where id=cur;
   g.phase := 'result'; changed := true;
 end if;
 if g.phase='turn' then
   while g.turn_index<=cardinality(g.turn_order) loop
     select * into c from hmo_private.choices where id=g.turn_order[g.turn_index];
     exit when exists(select 1 from public.room_players where room_id=p_room_id and user_id=c.user_id);
     g.turn_index := g.turn_index+1; changed := true;
   end loop;
   if g.turn_index>cardinality(g.turn_order) then g.phase := 'finished'; changed := true; end if;
 end if;
 if changed then
   update hmo_private.games set mode=g.mode,theme=g.theme,choice_count=g.choice_count,phase=g.phase,
     turn_order=g.turn_order,turn_index=g.turn_index,revision=revision+1 where room_id=p_room_id returning revision into g.revision;
   update public.hmo_events set revision=g.revision where room_id=p_room_id;
   if p_action='start' then update public.rooms set status='playing' where id=p_room_id; end if;
 end if;
 cur := g.turn_order[g.turn_index];
 select * into c from hmo_private.choices where id=cur;
 output := jsonb_build_object('revision',g.revision,'phase',g.phase,'mode',g.mode,'count',g.choice_count,
   'commonTheme',case when g.mode='common' then g.theme else null end,
   'myTheme',(select theme from hmo_private.players where room_id=p_room_id and user_id=u),
   'myReady',(select ready from hmo_private.players where room_id=p_room_id and user_id=u),
   'themes',(select jsonb_agg(jsonb_build_object('name',name,'search',search) order by name) from hmo_private.themes),
   'players',(select coalesce(jsonb_agg(jsonb_build_object('id',rp.user_id,'pseudo',rp.pseudo,'ready',hp.ready) order by rp.joined_at),'[]')
     from public.room_players rp join hmo_private.players hp using(room_id,user_id) where rp.room_id=p_room_id),
   'mine',(select coalesce(jsonb_agg(to_jsonb(ch) order by position),'[]') from hmo_private.choices ch where room_id=p_room_id and user_id=u),
   'cake',(select coalesce(jsonb_agg(to_jsonb(ch) order by array_position(g.turn_order,ch.id)),'[]') from hmo_private.choices ch where room_id=p_room_id and result is not null),
   'current',case when c.revealed then to_jsonb(c) else null end,
   'author',c.user_id,'turn',g.turn_index,'total',cardinality(g.turn_order),
   'myVote',(select vote from hmo_private.votes where choice_id=cur and user_id=u),
   'voted',(select count(*) from hmo_private.votes where choice_id=cur),
   'eligible',(select count(*) from public.room_players where room_id=p_room_id and user_id is distinct from c.user_id));
 return output;
end $$;
revoke all on function hmo_private.dispatch(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function hmo_private.dispatch(uuid,text,jsonb) to authenticated;
create or replace function public.hmo_rpc(p_room_id uuid,p_action text default 'get',p_payload jsonb default '{}')
returns jsonb language sql security invoker set search_path='' as $$ select hmo_private.dispatch(p_room_id,p_action,p_payload) $$;
revoke all on function public.hmo_rpc(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.hmo_rpc(uuid,text,jsonb) to authenticated;

-- Storage paths are opaque UUIDs; even knowing a future path is not enough to read it.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('hear-me-out','hear-me-out',false,3145728,array['image/jpeg','image/png','image/webp'])
 on conflict(id) do nothing;
create or replace function hmo_private.image_access(p_name text,p_write boolean default false)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare u uuid:=auth.uid(); rid uuid;
begin
 if u is null then return false; end if;
 begin rid:=split_part(p_name,'/',2)::uuid; exception when invalid_text_representation then return false; end;
 if not exists(select 1 from public.room_players where room_id=rid and user_id=u) then return false; end if;
 if p_write then
   return split_part(p_name,'/',1)=u::text and exists(
     select 1 from hmo_private.games g join hmo_private.players p using(room_id)
     where g.room_id=rid and g.phase='preparing' and p.user_id=u and not p.ready)
     and not exists(select 1 from hmo_private.choices where path=p_name or thumb=p_name);
 end if;
 return split_part(p_name,'/',1)=u::text or exists(
   select 1 from hmo_private.choices where room_id=rid and revealed and (path=p_name or thumb=p_name));
end $$;
revoke all on function hmo_private.image_access(text,boolean) from public,anon,authenticated;
grant execute on function hmo_private.image_access(text,boolean) to authenticated;
drop policy if exists hmo_read_image on storage.objects;
drop policy if exists hmo_upload_image on storage.objects;
drop policy if exists hmo_remove_staging on storage.objects;
create policy hmo_read_image on storage.objects for select to authenticated using(bucket_id='hear-me-out' and hmo_private.image_access(name,false));
create policy hmo_upload_image on storage.objects for insert to authenticated with check(bucket_id='hear-me-out' and hmo_private.image_access(name,true));
create policy hmo_remove_staging on storage.objects for delete to authenticated using(bucket_id='hear-me-out' and hmo_private.image_access(name,true));

-- The existing generic room APIs must not bypass this game's start/membership rules.
create or replace function hmo_private.guard_room() returns trigger
language plpgsql security definer set search_path='' as $$
declare room_game text; game_phase text;
begin
 if tg_table_name='room_players' then
   select game into room_game from public.rooms where id=new.room_id for update;
   if room_game='hear' and not exists(select 1 from public.room_players where room_id=new.room_id and user_id=new.user_id) then
     select phase into game_phase from hmo_private.games where room_id=new.room_id;
     if coalesce(game_phase,'setup') not in ('setup','preparing') then raise exception 'game_started'; end if;
     if (select count(*) from public.room_players where room_id=new.room_id)>=8 then raise exception 'maximum_8_players'; end if;
   end if;
 elsif old.game='hear' then
   if new.game<>old.game then raise exception 'game_locked'; end if;
   if new.status is distinct from old.status then
     select phase into game_phase from hmo_private.games where room_id=new.id;
     if (new.status='playing' and coalesce(game_phase,'setup') in ('setup','preparing'))
        or (new.status='lobby' and coalesce(game_phase,'setup') not in ('setup','preparing')) then raise exception 'hmo_use_game_rpc'; end if;
   end if;
 end if;
 return new;
end $$;
revoke all on function hmo_private.guard_room() from public,anon,authenticated;
drop trigger if exists hmo_guard_join on public.room_players;
create trigger hmo_guard_join before insert on public.room_players for each row execute function hmo_private.guard_room();
drop trigger if exists hmo_guard_status on public.rooms;
create trigger hmo_guard_status before update on public.rooms for each row execute function hmo_private.guard_room();

-- Preserve the existing room RPC body; add only the new game identifier.
do $$ declare body text; begin
 body:=pg_get_functiondef('public.create_room_rpc(text,text,text,jsonb)'::regprocedure);
 if position('''hear''' in body)=0 then
   if position('''who'', ''true'', ''liars'', ''photo'', ''blackjack''' in body)=0 then raise exception 'Unexpected create_room_rpc: review whitelist manually'; end if;
   execute replace(body,'''who'', ''true'', ''liars'', ''photo'', ''blackjack''','''who'', ''true'', ''liars'', ''photo'', ''blackjack'', ''hear''');
 end if;
 if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(
   select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='hmo_events')
 then alter publication supabase_realtime add table public.hmo_events; end if;
end $$;
notify pgrst,'reload schema';
commit;
