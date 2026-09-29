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
   return call(id,r,'add',{title,path:file,thumb});
 }
 const r=await room();
 await denied(()=>call(outsider,r),/not_member/);
 await denied(()=>call(null,r),/not_authenticated/);
 await call(a,r);
 await auth(a); await denied(()=>db.query('select * from hmo_private.choices'),/permission denied/);
 await db.exec('reset role'); await denied(()=>db.query("update public.rooms set status='playing' where id=$1",[r]),/hmo_use_game_rpc/);
 await denied(()=>call(b,r,'prepare',{mode:'common',theme:'Films',count:2}),/host_setup_only/);
 await call(a,r,'prepare',{mode:'common',theme:'Films',count:2});
 await denied(()=>call(a,r,'start'),/everyone_must_be_ready/);
 let sa=await add(a,r,'Secret A1'); sa=await add(a,r,'Secret A2');
 let sb=await add(b,r,'Secret B1'); sb=await add(b,r,'Secret B2');
 assert.equal(sb.mine.length,2); assert.ok(!JSON.stringify(sb).includes('Secret A'));
 await auth(b); assert.equal((await db.query("select * from storage.objects where name=$1",[sa.mine[0].path])).rows.length,0);
 assert.equal((await db.query('select hmo_private.image_access($1,false) allowed',[sa.mine[0].path])).rows[0].allowed,false);
 await call(a,r,'ready',{ready:true}); await call(b,r,'ready',{ready:true});
 await denied(()=>call(a,r,'remove',{id:sa.mine[0].id}),/selection_locked/);
 let state=await call(a,r,'start');
 assert.equal(state.phase,'turn'); assert.equal(state.total,4); assert.equal(state.current,null);
 for (let i=0;i<4;i++) {
   const author=state.author, other=author===a?b:a;
   await denied(()=>call(other,r,'reveal'),/not_your_turn/);
   state=await call(author,r,'reveal'); assert.equal(state.phase,'defending');
   await auth(other); assert.equal((await db.query("select * from storage.objects where name=$1",[state.current.path])).rows.length,1);
   state=await call(author,r,'open_vote');
   await denied(()=>call(author,r,'vote',{id:state.current.id,vote:'yes'}),/cannot_vote/);
   await denied(()=>call(other,r,'vote',{id:randomUUID(),vote:'yes'}),/stale_turn/);
   state=await call(other,r,'vote',{id:state.current.id,vote:'yes'});
   assert.equal(state.phase,'result'); assert.equal(state.current.result.yes,1);
   await denied(()=>call(other,r,'vote',{id:state.current.id,vote:'no'}),/cannot_vote/);
   const restored=await call(author,r); assert.deepEqual(restored.cake,state.cake);
   state=await call(author,r,'next');
 }
 assert.equal(state.phase,'finished'); assert.equal(state.cake.length,4);
 const ri=await room();
 await call(a,ri,'prepare',{mode:'individual',theme:'Films',count:1});
 const ia=await call(a,ri), ib=await call(b,ri);
 assert.notEqual(ia.myTheme,ib.myTheme); assert.equal(ia.commonTheme,null);
 assert.ok(!JSON.stringify(ia.players).includes(ib.myTheme));
 await add(a,ri,'A individual'); await add(b,ri,'B individual');
 await call(a,ri,'ready',{ready:true}); await call(b,ri,'ready',{ready:true});
 state=await call(a,ri,'start'); state=await call(state.author,ri,'reveal'); state=await call(state.author,ri,'open_vote');
 const author=state.author, departed=author===a?b:a;
 await db.exec('reset role'); await db.query('delete from public.room_players where room_id=$1 and user_id=$2',[ri,departed]);
 state=await call(author,ri); assert.equal(state.phase,'result');
 state=await call(author,ri,'next'); assert.equal(state.phase,'finished'); assert.equal(state.cake.length,1);
 await auth(outsider); assert.equal((await db.query('select * from public.hmo_events')).rows.length,0);
 await db.exec('reset role; set role anon'); await denied(()=>db.query('select public.hmo_rpc($1)',[r]),/permission denied/);
 console.log('PASS: setup idempotence, two modes, four turns, secrecy/RLS, outsider/anon denial, readiness, author-only reveal, stale/duplicate/self votes, refresh, departure, final cake.');
 await db.close();
})().catch(e=>{ console.error(e); process.exitCode=1; });
