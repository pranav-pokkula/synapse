import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {beforeAll,afterAll,describe,it,expect} from 'vitest';
let db:PGlite;
const alice='11111111-1111-4111-8111-111111111111',bob='22222222-2222-4222-8222-222222222222';
beforeAll(async()=>{db=new PGlite();await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;insert into auth.users values('${alice}'),('${bob}');`);await db.exec(await readFile('supabase/migrations/20261122102555_learning_records.sql','utf8'));},30000);
afterAll(async()=>{await db.close();});
async function asUser(id:string){await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','${id}',false);`);}
describe('Postgres RLS with a local auth.uid stub (not hosted Supabase auth)',()=>{
 it('allows an owner to persist their own records',async()=>{await asUser(alice);await db.query('insert into learning_records(owner_id,kind,id,payload) values($1,$2,$3,$4)',[alice,'progress','sample',{level:'advanced'}]);const rows=await db.query('select * from learning_records');expect(rows.rows).toHaveLength(1);});
 it('prevents another user from reading or deleting those records',async()=>{await asUser(bob);expect((await db.query('select * from learning_records')).rows).toHaveLength(0);expect((await db.query('delete from learning_records returning id')).rows).toHaveLength(0);});
 it('rejects cross-user inserts and reassignment',async()=>{await asUser(bob);await expect(db.query('insert into learning_records(owner_id,kind,id,payload) values($1,$2,$3,$4)',[alice,'progress','forged',{}])).rejects.toThrow(/row-level security/);await asUser(alice);await expect(db.query('update learning_records set owner_id=$1',[bob])).rejects.toThrow(/row-level security/);});
 it('denies anonymous data access',async()=>{await db.exec('reset role;set role anon;');await expect(db.query('select * from learning_records')).rejects.toThrow(/permission denied/);});
 it('enforces atomic quota and rejects a client-selected larger cap',async()=>{await asUser(alice);for(let i=0;i<5;i++)expect((await db.query<{ok:boolean}>("select consume_learning_quota('imports-hour',99999,1) as ok")).rows[0].ok).toBe(true);expect((await db.query<{ok:boolean}>("select consume_learning_quota('imports-hour',99999,1) as ok")).rows[0].ok).toBe(false);});
 it('does not let users reset quota rows through Data API privileges',async()=>{await asUser(alice);await expect(db.query('delete from learning_quotas')).rejects.toThrow(/permission denied/);});
 it('quota buckets are independent across owners',async()=>{await asUser(bob);expect((await db.query<{ok:boolean}>("select consume_learning_quota('imports-hour',5,3600) as ok")).rows[0].ok).toBe(true);});
 it('deletes only the current owner’s learning records',async()=>{await asUser(alice);await db.exec('delete from learning_records');expect((await db.query('select * from learning_records')).rows).toHaveLength(0);});
});
