-- SYNAPSE only. Do not run this against an unrelated project's database.
create table public.learning_records (
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('profile','import','snapshot','lesson','attempt','progress','tutor','tutor-cache')),
  id text not null check (length(id) between 1 and 100),
  payload jsonb not null check (octet_length(payload::text) <= 2500000),
  updated_at timestamptz not null default now(),
  primary key (owner_id, kind, id)
);
create index learning_records_recent on public.learning_records(owner_id, kind, updated_at desc);
alter table public.learning_records enable row level security;
create policy own_learning_records on public.learning_records
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
revoke all on public.learning_records from anon;
grant select, insert, update, delete on public.learning_records to authenticated;

-- Quotas are server-defined in the function, never caller-defined.
create table public.learning_quotas (
  owner_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null,
  count integer not null check (count >= 0),
  resets_at timestamptz not null,
  primary key(owner_id,bucket)
);
alter table public.learning_quotas enable row level security;
revoke all on public.learning_quotas from anon, authenticated;
create schema if not exists synapse_private;
revoke all on schema synapse_private from public, anon, authenticated;

-- Definer access is confined to a non-exposed schema. All inputs are clamped,
-- ownership comes exclusively from auth.uid(), and the table is not writable
-- through the Data API. The public wrapper is security invoker.
create function synapse_private.consume_quota(bucket_name text, max_count integer, window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  cap integer;
  window_size integer;
  used integer;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  select q.cap, q.seconds into cap, window_size from (values
    ('imports-hour',5,3600),('import-steps',60,3600),('assessments',120,3600),
    ('tutor',40,3600),('email-auth',3,3600),('model-daily',20,86400)
  ) as q(bucket,cap,seconds) where q.bucket=bucket_name;
  if cap is null or max_count < 1 or window_seconds < 1 then raise exception 'Unknown quota'; end if;
  cap := least(cap,max_count);
  window_size := greatest(window_size,window_seconds);
  insert into public.learning_quotas as q(owner_id,bucket,count,resets_at)
  values(uid,bucket_name,1,now()+make_interval(secs=>window_size))
  on conflict(owner_id,bucket) do update set
    count=case when q.resets_at<=now() then 1 else q.count+1 end,
    resets_at=case when q.resets_at<=now() then now()+make_interval(secs=>window_size) else q.resets_at end
  where q.resets_at<=now() or q.count<cap
  returning count into used;
  return used is not null;
end;
$$;
revoke all on function synapse_private.consume_quota(text,integer,integer) from public,anon;
grant usage on schema synapse_private to authenticated;
grant execute on function synapse_private.consume_quota(text,integer,integer) to authenticated;
create function public.consume_learning_quota(bucket_name text,max_count integer,window_seconds integer)
returns boolean language sql security invoker set search_path='' as $$
  select synapse_private.consume_quota(bucket_name,max_count,window_seconds);
$$;
revoke all on function public.consume_learning_quota(text,integer,integer) from public,anon;
grant execute on function public.consume_learning_quota(text,integer,integer) to authenticated;

-- No service-role key is needed by the web app. Deploy with the publishable key
-- and user cookies. Enable anonymous auth for guest imports, plus email auth.
