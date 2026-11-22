-- Bánh Mì · kho đồng bộ (mỗi người chỉ thấy dữ liệu của chính mình)
create table if not exists public.kv (
  user_id uuid not null references auth.users(id) on delete cascade,
  k text not null, v text, t bigint not null default 0, del boolean not null default false,
  updated_at timestamptz not null default clock_timestamp(),
  primary key (user_id, k)
);
create table if not exists public.rec (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null, db text not null, st text not null, data jsonb, t bigint not null default 0, del boolean not null default false,
  updated_at timestamptz not null default clock_timestamp(),
  primary key (user_id, id)
);
create index if not exists kv_upd on public.kv (user_id, updated_at);
create index if not exists rec_upd on public.rec (user_id, updated_at);

create or replace function public.bm_touch() returns trigger language plpgsql as $$
begin new.updated_at := clock_timestamp(); return new; end $$;
drop trigger if exists kv_touch on public.kv;
create trigger kv_touch before insert or update on public.kv for each row execute function public.bm_touch();
drop trigger if exists rec_touch on public.rec;
create trigger rec_touch before insert or update on public.rec for each row execute function public.bm_touch();

alter table public.kv enable row level security;
alter table public.rec enable row level security;
drop policy if exists kv_own on public.kv;
create policy kv_own on public.kv for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists rec_own on public.rec;
create policy rec_own on public.rec for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke all on public.kv, public.rec from anon;
grant select, insert, update, delete on public.kv, public.rec to authenticated;

-- thư mục file riêng tư: files/<user_id>/...
insert into storage.buckets (id, name, public, file_size_limit)
values ('files', 'files', false, 52428800)
on conflict (id) do update set public = false;
drop policy if exists bm_files_sel on storage.objects;
drop policy if exists bm_files_ins on storage.objects;
drop policy if exists bm_files_upd on storage.objects;
drop policy if exists bm_files_del on storage.objects;
create policy bm_files_sel on storage.objects for select to authenticated using (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy bm_files_ins on storage.objects for insert to authenticated with check (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy bm_files_upd on storage.objects for update to authenticated using (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy bm_files_del on storage.objects for delete to authenticated using (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);
create or replace function public.bm_ping() returns int language sql stable as $$ select 1 $$; grant execute on function public.bm_ping() to anon;
