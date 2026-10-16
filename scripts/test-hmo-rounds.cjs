// Offline real PostgreSQL engine tests. No credentials or production writes.
// Install @electric-sql/pglite@0.5.8 locally, or set NODE_PATH to a test tools directory.
const {PGlite} = require('@electric-sql/pglite');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
(async () => {
 const db = new PGlite();
 await db.exec(`create role anon; create role authenticated;
 create schema auth; create schema storage;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,storage to authenticated; grant execute on function auth.uid() to authenticated;
 create table public.rooms(id uuid primary key,code text,game text,host_id uuid,status text default 'lobby',settings jsonb default '{}');
 create table public.room_players(room_id uuid references public.rooms on delete cascade,user_id uuid,pseudo text,joined_at timestamptz default now(),primary key(room_id,user_id));
 grant select on public.room_players to authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,primary key(bucket_id,name));
 alter table storage.objects enable row level security;
 grant select,insert,delete on storage.objects to authenticated;
 create function public.create_room_rpc(text,text,text,jsonb) returns void language plpgsql as $$ begin
 if $2 not in ('who', 'true', 'liars', 'photo', 'blackjack') then raise exception 'invalid_game'; end if; end $$;`);
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase-hear-me-out.sql'),'utf8'));
 // Reapplication is safe and must not reset a game.
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase-hear-me-out.sql'),'utf8'));
 const a=randomUUID(), b=randomUUID(), outsider=randomUUID();
 for (const id of [a,b,outsider]) await db.query('insert into auth.users values($1)',[id]);
 const auth=async id => { await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id || '']); await db.exec('set role authenticated'); };
 const call=async(id,r,action='get',payload={}) => { await auth(id); const q=await db.query('select public.hmo_rpc($1,$2,$3) s',[r,action,JSON.stringify(payload)]); return q.rows[0].s; };
 const denied=async(fn,pattern) => { await assert.rejects(fn,pattern); };
 async function room() {
   await db.exec('reset role'); const r=randomUUID();
   await db.query("insert into public.rooms(id,game,host_id) values($1,'hear',$2)",[r,a]);
   await db.query("insert into public.room_players(room_id,user_id,pseudo) values($1,$2,'A'),($1,$3,'B')",[r,a,b]);
   return r;
 }
 async function add(id,r,title) {
   const base=`${id}/${r}/${randomUUID()}`, file=base+'.jpg', thumb=base+'-thumb.jpg';
   await auth(id); await db.query("insert into storage.objects(bucket_id,name) values('hear-me-out',$1),('hear-me-out',$2)",[file,thumb]);
   const s=await call(id,r); return call(id,r,'add',{title,path:file,thumb,round:s.round});
 }

 const legacy=await room();await call(a,legacy,'prepare',{mode:'common',theme:'Films',count:1});
 // Upgrade twice: additive and idempotent, no destructive reset.
 await db.exec('reset role');
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase-hear-me-out-rounds.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase-hear-me-out-rounds.sql'),'utf8'));
 const expire=async r=>{await db.exec('reset role');await db.query("update hmo_private.games set deadline=clock_timestamp()-interval '1 second' where room_id=$1",[r]);};
 const r=await room();
 assert.equal((await call(a,legacy)).phase,'preparing');
 assert.equal((await call(a,legacy)).flowVersion,undefined);
 await denied(()=>call(null,r),/not_authenticated/); await denied(()=>call(outsider,r),/not_member/);
 let s=await call(a,r); assert.equal(s.flowVersion,2);assert.equal(s.phase,'setup');assert.equal(s.myTheme,null);
 await denied(()=>add(a,r,'Lobby upload'),/row-level security/);
 await denied(()=>call(b,r,'start',{mode:'common',rounds:2}),/host_setup_only/);
 await denied(()=>call(a,r,'configure',{mode:'chaos',rounds:2}),/invalid_settings/);
 await denied(()=>call(a,r,'configure',{mode:'common',rounds:8}),/invalid_settings/);
 s=await call(a,r,'start',{mode:'common',rounds:2});
 assert.equal(s.phase,'collecting');assert.equal(s.round,1);assert.equal(s.rounds,2);
 assert.ok(Date.parse(s.deadline)-Date.parse(s.serverNow)>119000);
 assert.equal((await call(b,r)).myTheme,s.myTheme);
 await denied(()=>call(a,r,'next',{round:1}),/wrong_phase/);
 const oldDeadline=s.deadline; assert.equal((await call(b,r)).deadline,oldDeadline);
 const sa=await add(a,r,'First A');
 assert.equal(sa.phase,'collecting');
 const secret=await call(b,r); assert.ok(!JSON.stringify(secret).includes('First A')); assert.equal(secret.current,null);
 await auth(b);assert.equal((await db.query("select * from storage.objects where name=$1",[sa.mine[0].path])).rows.length,0);
 await denied(()=>db.query('select * from hmo_private.choices'),/permission denied/);
 const sb=await add(b,r,'First B'); assert.equal(sb.phase,'voting');
 await denied(()=>call(a,r,'remove',{id:sa.mine[0].id,round:1}),/selection_locked/);
 s=await call(a,r); assert.equal(s.phase,'voting');assert.equal(s.current.revealed,true);
 let firstId=s.current.id;
 for(let i=0;i<2;i++){
   const author=s.author,other=author===a?b:a,id=s.current.id;
   await denied(()=>call(author,r,'vote',{id,vote:'yes'}),/cannot_vote/);
   await denied(()=>call(other,r,'vote',{id:randomUUID(),vote:'yes'}),/stale_turn/);
   await auth(other);assert.equal((await db.query("select * from storage.objects where name=$1",[s.current.path])).rows.length,1);
   s=await call(other,r,'vote',{id,vote:i?'no':'yes'});assert.equal(s.phase,'result');
   await denied(()=>call(other,r,'vote',{id,vote:'yes'}),/cannot_vote/);
   assert.deepEqual((await call(author,r)).cake,s.cake);
   const resultDeadline=s.deadline;
   assert.equal((await call(other,r)).phase,'result');
   assert.equal((await call(other,r)).deadline,resultDeadline);
   await expire(r); s=await call(other,r);
   assert.notEqual(s.current?.id,id);
 }
 assert.equal(s.phase,'round_end');assert.equal(s.cake.length,2);
 await denied(()=>call(b,r,'next',{round:1}),/not_your_turn/);
 await expire(r); s=await call(b,r);assert.equal(s.round,2);assert.equal(s.phase,'collecting');assert.equal(s.mine.length,0);
 await denied(()=>call(a,r,'add',{round:1}),/stale_round/);
 await add(a,r,'Second A'); // B misses the timer: skip B, retain membership.
 await expire(r);s=await call(b,r);assert.equal(s.phase,'voting');assert.equal(s.current.title,'Second A');
 await denied(()=>call(a,r,'next',{id:firstId,round:1}),/wrong_phase/);
 s=await call(b,r,'vote',{id:s.current.id,vote:'meh'});
 await expire(r); s=await call(b,r);
 assert.equal(s.phase,'finished');assert.equal(s.cake.length,3);
 const ri=await room();await call(a,ri,'start',{mode:'individual',rounds:1});
 const ia=await call(a,ri),ib=await call(b,ri);
 assert.notEqual(ia.myTheme,ib.myTheme);assert.equal(ia.commonTheme,null);
 assert.ok(!JSON.stringify(ia.players).includes(ib.myTheme));
 await add(a,ri,'Individual A');await add(b,ri,'Individual B');await expire(ri);s=await call(a,ri);
 const author=s.author,departed=author===a?b:a;
 await db.exec('reset role');await db.query('delete from public.room_players where room_id=$1 and user_id=$2',[ri,departed]);
 await db.query('update public.rooms set host_id=$1 where id=$2',[author,ri]);
 s=await call(author,ri);assert.equal(s.phase,'result');
 s=await call(author,ri,'next',{id:s.current.id,round:1});assert.equal(s.phase,'finished');assert.equal(s.cake.length,1);
 const empty=await room();await call(a,empty,'start',{mode:'common',rounds:1});await expire(empty);
 assert.equal((await call(a,empty)).phase,'finished');
 await auth(outsider);assert.equal((await db.query('select * from public.hmo_events')).rows.length,0);
 console.log('PASS: timed rounds, random themes, lobby upload denied, exact server deadline, refresh persistence, late uploads denied, secret images/RLS, ordered automatic reveals, stale/self/duplicate votes, multiple rounds, missing submissions, departures, empty final.');
 await db.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
