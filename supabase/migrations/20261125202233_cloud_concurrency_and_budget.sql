-- Dedicated SYNAPSE database only. No changes to unrelated application tables.
-- Fenced leases coordinate requests across serverless instances. A late worker
-- cannot overwrite a checkpoint after its lease expires or is replaced.
create table synapse_private.learning_locks (
  owner_id uuid not null references auth.users(id) on delete cascade,
  lock_key text not null check (length(lock_key) between 1 and 160),
  token uuid not null,
  expires_at timestamptz not null,
  primary key(owner_id,lock_key)
);
alter table synapse_private.learning_locks enable row level security;
revoke all on synapse_private.learning_locks from public,anon,authenticated;

create function synapse_private.acquire_lock(lock_key text,lease_token uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare uid uuid := auth.uid(); acquired uuid;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if length(lock_key) not between 1 and 160 then raise exception 'Invalid lock'; end if;
  insert into synapse_private.learning_locks as l(owner_id,lock_key,token,expires_at)
    values(uid,lock_key,lease_token,now()+interval '90 seconds')
  on conflict on constraint learning_locks_pkey do update set token=excluded.token,expires_at=excluded.expires_at
    where l.expires_at <= now()
  returning token into acquired;
  return acquired is not null;
end; $$;
create function synapse_private.release_lock(lock_key text,lease_token uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from synapse_private.learning_locks l
    where l.owner_id=auth.uid() and l.lock_key=release_lock.lock_key and l.token=lease_token;
end; $$;
create function synapse_private.put_locked_record(lock_key text,lease_token uuid,record_kind text,record_id text,record_payload jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Authentication required'; end if;
  perform 1 from synapse_private.learning_locks l
    where l.owner_id=uid and l.lock_key=put_locked_record.lock_key
      and l.token=lease_token and l.expires_at>now() for update;
  if not found then raise exception 'Lease expired' using errcode='40001'; end if;
  insert into public.learning_records(owner_id,kind,id,payload,updated_at)
    values(uid,record_kind,record_id,record_payload,now())
  on conflict(owner_id,kind,id) do update set payload=excluded.payload,updated_at=excluded.updated_at;
end; $$;

create table synapse_private.global_usage (
  bucket text primary key,
  window_start timestamptz not null,
  count integer not null check(count>=0),
  reserved_usd numeric(12,6) not null default 0 check(reserved_usd>=0)
);
alter table synapse_private.global_usage enable row level security;
revoke all on synapse_private.global_usage from public,anon,authenticated;
-- Fixed deployment-wide ceilings cannot be enlarged by clients or new sessions.
-- Model reservations are conservative accounting, not a provider-price promise:
-- Prune Shield's separately verified $1 UTC-day cap is the dollar enforcement.
create function synapse_private.consume_global(bucket_name text)
returns boolean language plpgsql security definer set search_path='' as $$
declare cap integer; window_start timestamptz; reservation numeric := 0; used integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  case bucket_name
    when 'model-day' then cap:=50; window_start:=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC'; reservation:=0.01;
    when 'model-minute' then cap:=8; window_start:=date_trunc('minute',now());
    when 'github-hour' then cap:=55; window_start:=date_trunc('hour',now());
    else raise exception 'Unknown global quota';
  end case;
  insert into synapse_private.global_usage as g(bucket,window_start,count,reserved_usd)
    values(bucket_name,window_start,1,reservation)
  on conflict(bucket) do update set
    window_start=excluded.window_start,
    count=case when g.window_start<excluded.window_start then 1 else g.count+1 end,
    reserved_usd=case when g.window_start<excluded.window_start then reservation else g.reserved_usd+reservation end
  where g.window_start<excluded.window_start or g.count<cap
  returning count into used;
  return used is not null;
end; $$;

create function public.acquire_learning_lock(lock_key text,lease_token uuid)
returns boolean language sql security invoker set search_path='' as $$
  select synapse_private.acquire_lock(lock_key,lease_token);
$$;
create function public.release_learning_lock(lock_key text,lease_token uuid)
returns void language sql security invoker set search_path='' as $$
  select synapse_private.release_lock(lock_key,lease_token);
$$;
create function public.put_locked_learning_record(lock_key text,lease_token uuid,record_kind text,record_id text,record_payload jsonb)
returns void language sql security invoker set search_path='' as $$
  select synapse_private.put_locked_record(lock_key,lease_token,record_kind,record_id,record_payload);
$$;
create function public.consume_learning_global_quota(bucket_name text)
returns boolean language sql security invoker set search_path='' as $$
  select synapse_private.consume_global(bucket_name);
$$;

revoke all on function synapse_private.acquire_lock(text,uuid), synapse_private.release_lock(text,uuid), synapse_private.put_locked_record(text,uuid,text,text,jsonb), synapse_private.consume_global(text) from public,anon;
grant execute on function synapse_private.acquire_lock(text,uuid), synapse_private.release_lock(text,uuid), synapse_private.put_locked_record(text,uuid,text,text,jsonb), synapse_private.consume_global(text) to authenticated;
revoke all on function public.acquire_learning_lock(text,uuid), public.release_learning_lock(text,uuid), public.put_locked_learning_record(text,uuid,text,text,jsonb), public.consume_learning_global_quota(text) from public,anon;
grant execute on function public.acquire_learning_lock(text,uuid), public.release_learning_lock(text,uuid), public.put_locked_learning_record(text,uuid,text,text,jsonb), public.consume_learning_global_quota(text) to authenticated;
