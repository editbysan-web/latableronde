-- Additive timed-round upgrade. Apply AFTER supabase-hear-me-out.sql.
-- Existing v1 games keep their original RPC/flow until finished.
begin;
alter table hmo_private.games add column if not exists flow_version integer not null default 1;
alter table hmo_private.games add column if not exists round_count integer not null default 3 check(round_count between 1 and 7);
alter table hmo_private.games add column if not exists round_number integer not null default 0;
alter table hmo_private.games add column if not exists deadline timestamptz;
alter table hmo_private.games drop constraint if exists games_phase_check;
alter table hmo_private.games add constraint games_phase_check check(phase in ('setup','preparing','turn','defending','voting','result','finished','collecting','round_end'));

create or replace function hmo_private.round_dispatch(p_room_id uuid,p_action text,p_payload jsonb default '{}')
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 u uuid:=auth.uid(); r public.rooms; g hmo_private.games; c hmo_private.choices;
 p record; pool text[]; n integer:=0; changed boolean:=false; begin_round boolean:=false;
 cur uuid; counts jsonb; round_ids uuid[]; now_at timestamptz:=clock_timestamp();
begin
 if u is null then raise exception 'not_authenticated'; end if;
 select * into r from public.rooms where id=p_room_id for update;
 if r.id is null or r.game<>'hear' or not exists(select 1 from public.room_players where room_id=p_room_id and user_id=u)
 then raise exception 'not_member'; end if;
 -- Room lock serializes initialization, uploads, expiry and votes across clients.
 insert into hmo_private.games(room_id,flow_version,choice_count) values(p_room_id,2,1) on conflict do nothing;
 select * into g from hmo_private.games where room_id=p_room_id for update;
 now_at:=clock_timestamp();
 if g.flow_version=1 then return hmo_private.dispatch(p_room_id,p_action,p_payload); end if;
 insert into public.hmo_events(room_id) values(p_room_id) on conflict do nothing;
 if (select count(*) from public.room_players where room_id=p_room_id)>8 then raise exception 'maximum_8_players'; end if;
 for p in select rp.user_id from public.room_players rp where rp.room_id=p_room_id
   and not exists(select 1 from hmo_private.players hp where hp.room_id=p_room_id and hp.user_id=rp.user_id)
 loop
   if g.phase<>'setup' then raise exception 'game_started'; end if;
   insert into hmo_private.players values(p_room_id,p.user_id,g.theme,false); changed:=true;
 end loop;
 if p_action in ('configure','start') then
   if r.host_id<>u or g.phase<>'setup' then raise exception 'host_setup_only'; end if;
   if p_action='configure' or p_payload ? 'mode' then
     g.mode:=p_payload->>'mode'; g.round_count:=(p_payload->>'rounds')::integer;
     if g.mode is null or g.mode not in ('common','individual') or g.round_count is null or g.round_count not between 1 and 7 then raise exception 'invalid_settings'; end if;
   end if;
   if p_action='start' then
     if (select count(*) from public.room_players where room_id=p_room_id)<2 then raise exception 'minimum_two_players'; end if;
     begin_round:=true;
   end if;
   changed:=true;
 elsif p_action in ('add','remove') then
   if g.phase<>'collecting' or now_at>=g.deadline then raise exception 'selection_locked'; end if;
   if (p_payload->>'round')::integer is distinct from g.round_number then raise exception 'stale_round'; end if;
   if p_action='remove' then
     delete from hmo_private.choices where room_id=p_room_id and user_id=u and position=g.round_number and not revealed and id=(p_payload->>'id')::uuid;
   else
     if exists(select 1 from hmo_private.choices where room_id=p_room_id and user_id=u and position=g.round_number) then raise exception 'selection_full'; end if;
     if coalesce(p_payload->>'path','') not like u::text||'/'||p_room_id::text||'/%'
       or coalesce(p_payload->>'thumb','') not like u::text||'/'||p_room_id::text||'/%'
       or p_payload->>'path'=p_payload->>'thumb'
       or not exists(select 1 from storage.objects where bucket_id='hear-me-out' and name=p_payload->>'path')
       or not exists(select 1 from storage.objects where bucket_id='hear-me-out' and name=p_payload->>'thumb') then raise exception 'invalid_image'; end if;
     insert into hmo_private.choices(room_id,user_id,pseudo,theme,position,title,path,thumb,credit,source)
     select p_room_id,u,rp.pseudo,hp.theme,g.round_number,trim(p_payload->>'title'),p_payload->>'path',p_payload->>'thumb',coalesce(p_payload->>'credit',''),coalesce(p_payload->>'source','')
     from hmo_private.players hp join public.room_players rp using(room_id,user_id) where hp.room_id=p_room_id and hp.user_id=u;
   end if;
   changed:=true;
 elsif p_action='next' then
   cur:=g.turn_order[g.turn_index]; select * into c from hmo_private.choices where id=cur;
   if g.phase not in ('result','round_end') then raise exception 'wrong_phase'; end if;
   if u<>r.host_id and (c.user_id is null or u<>c.user_id) then raise exception 'not_your_turn'; end if;
   -- A stale double click must never advance a different photo or round.
   if (p_payload->>'round')::integer is distinct from g.round_number or (g.phase='result' and (p_payload->>'id')::uuid is distinct from cur) then raise exception 'stale_turn'; end if;
   if g.phase='round_end' then begin_round:=g.round_number<g.round_count;
     if not begin_round then g.phase:='finished'; end if;
   else g.turn_index:=g.turn_index+1; g.phase:='turn'; end if;
   changed:=true;
 elsif p_action='vote' then
   cur:=g.turn_order[g.turn_index]; select * into c from hmo_private.choices where id=cur;
   if g.phase<>'voting' or u=c.user_id then raise exception 'cannot_vote'; end if;
   if (p_payload->>'id')::uuid is distinct from cur then raise exception 'stale_turn'; end if;
   insert into hmo_private.votes values(cur,u,p_payload->>'vote'); changed:=true;
 elsif p_action<>'get' or p_action is null then raise exception 'invalid_action'; end if;

 -- Every member can materialize automatic transitions; the room lock prevents double advancement.
 if g.phase in ('result','round_end') and now_at>=g.deadline then
   if g.phase='result' then g.turn_index:=g.turn_index+1; g.phase:='turn';
   else begin_round:=g.round_number<g.round_count;
     if not begin_round then g.phase:='finished'; end if;
   end if;
   changed:=true;
 end if;
 if g.phase='collecting' and (now_at>=g.deadline or (
   exists(select 1 from public.room_players where room_id=p_room_id)
   and not exists(select 1 from public.room_players rp where rp.room_id=p_room_id
     and not exists(select 1 from hmo_private.choices ch where ch.room_id=p_room_id
       and ch.user_id=rp.user_id and ch.position=g.round_number))
 )) then
   select coalesce(array_agg(ch.id order by rp.joined_at,rp.user_id),'{}') into round_ids
     from hmo_private.choices ch join public.room_players rp using(room_id,user_id)
     where ch.room_id=p_room_id and ch.position=g.round_number;
   g.turn_index:=cardinality(g.turn_order)+1; g.turn_order:=g.turn_order||round_ids;
   g.phase:='turn'; changed:=true;
 end if;
 if g.phase='turn' then
   while g.turn_index<=cardinality(g.turn_order) loop
     select * into c from hmo_private.choices where id=g.turn_order[g.turn_index];
     exit when exists(select 1 from public.room_players where room_id=p_room_id and user_id=c.user_id);
     g.turn_index:=g.turn_index+1;
   end loop;
   if g.turn_index>cardinality(g.turn_order) then
     if g.round_number>=g.round_count then g.phase:='finished';
     else g.phase:='round_end'; g.deadline:=now_at+interval '5 seconds'; end if;
   else
     update hmo_private.choices set revealed=true where id=g.turn_order[g.turn_index];
     g.phase:='voting';
   end if;
   changed:=true;
 end if;
 if begin_round then
   g.round_number:=g.round_number+1; g.phase:='collecting'; g.deadline:=now_at+interval '2 minutes';
   select array_agg(name order by random()) into pool from hmo_private.themes where name<>g.theme;
   g.theme:=pool[1]; n:=0;
   for p in select hp.user_id from hmo_private.players hp join public.room_players rp using(room_id,user_id) where hp.room_id=p_room_id order by random() loop
     n:=n+1;
     update hmo_private.players set theme=case when g.mode='common' then g.theme else pool[n] end,ready=false where room_id=p_room_id and user_id=p.user_id;
   end loop;
   changed:=true;
 end if;
 cur:=g.turn_order[g.turn_index]; select * into c from hmo_private.choices where id=cur;
 if g.phase='voting' and not exists(
   select 1 from public.room_players rp where rp.room_id=p_room_id and rp.user_id<>c.user_id
   and not exists(select 1 from hmo_private.votes v where v.choice_id=cur and v.user_id=rp.user_id)
 ) then
   select jsonb_build_object('yes',count(*) filter(where vote='yes'),'meh',count(*) filter(where vote='meh'),'no',count(*) filter(where vote='no')) into counts from hmo_private.votes where choice_id=cur;
   update hmo_private.choices set result=counts where id=cur returning * into c;
   g.phase:='result'; g.deadline:=now_at+interval '3 seconds'; changed:=true;
 end if;
 if changed then
   update hmo_private.games set mode=g.mode,theme=g.theme,phase=g.phase,round_count=g.round_count,round_number=g.round_number,deadline=g.deadline,
     turn_order=g.turn_order,turn_index=g.turn_index,revision=revision+1 where room_id=p_room_id returning revision into g.revision;
   update public.hmo_events set revision=g.revision where room_id=p_room_id;
   if p_action='start' then update public.rooms set status='playing' where id=p_room_id; end if;
 end if;
 return jsonb_build_object('flowVersion',2,'revision',g.revision,'phase',g.phase,'mode',g.mode,'count',1,
   'round',g.round_number,'rounds',g.round_count,'deadline',g.deadline,'serverNow',clock_timestamp(),
   'commonTheme',case when g.mode='common' and g.phase<>'setup' then g.theme else null end,
   'myTheme',case when g.phase<>'setup' then (select theme from hmo_private.players where room_id=p_room_id and user_id=u) else null end,
   'themes',(select jsonb_agg(jsonb_build_object('name',name,'search',search) order by name) from hmo_private.themes),
   'players',(select coalesce(jsonb_agg(jsonb_build_object('id',rp.user_id,'pseudo',rp.pseudo,'ready',exists(select 1 from hmo_private.choices ch where ch.room_id=p_room_id and ch.user_id=rp.user_id and ch.position=g.round_number)) order by rp.joined_at),'[]') from public.room_players rp where rp.room_id=p_room_id),
   'mine',(select coalesce(jsonb_agg(to_jsonb(ch)),'[]') from hmo_private.choices ch where room_id=p_room_id and user_id=u and position=g.round_number),
   'cake',(select coalesce(jsonb_agg(to_jsonb(ch) order by array_position(g.turn_order,ch.id)),'[]') from hmo_private.choices ch where room_id=p_room_id and result is not null),
   'current',case when g.phase in ('voting','result') and c.revealed then to_jsonb(c) else null end,
   'author',case when g.phase in ('voting','result') then c.user_id else null end,'turn',g.turn_index,'total',cardinality(g.turn_order),
   'myVote',(select vote from hmo_private.votes where choice_id=cur and user_id=u),
   'voted',(select count(*) from hmo_private.votes where choice_id=cur),
   'eligible',(select count(*) from public.room_players where room_id=p_room_id and user_id is distinct from c.user_id));
end $$;
revoke all on function hmo_private.round_dispatch(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function hmo_private.round_dispatch(uuid,text,jsonb) to authenticated;
create or replace function public.hmo_rpc(p_room_id uuid,p_action text default 'get',p_payload jsonb default '{}')
returns jsonb language sql security invoker set search_path='' as $$ select hmo_private.round_dispatch(p_room_id,p_action,p_payload) $$;

-- Keep v1 access semantics; timed games only accept uploads before the server deadline.
create or replace function hmo_private.image_access(p_name text,p_write boolean default false)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare u uuid:=auth.uid(); rid uuid;
begin
 if u is null then return false; end if;
 begin rid:=split_part(p_name,'/',2)::uuid; exception when invalid_text_representation then return false; end;
 if not exists(select 1 from public.room_players where room_id=rid and user_id=u) then return false; end if;
 if p_write then
   return split_part(p_name,'/',1)=u::text and exists(
     select 1 from hmo_private.games g join hmo_private.players p using(room_id) where g.room_id=rid and p.user_id=u
     and ((g.flow_version=1 and g.phase='preparing' and not p.ready) or (g.flow_version=2 and g.phase='collecting' and clock_timestamp()<g.deadline)))
     and not exists(select 1 from hmo_private.choices where path=p_name or thumb=p_name);
 end if;
 return split_part(p_name,'/',1)=u::text or exists(select 1 from hmo_private.choices where room_id=rid and revealed and (path=p_name or thumb=p_name));
end $$;
notify pgrst,'reload schema';
commit;
