-- Alleen voor lokale tests buiten Supabase: bootst het auth-schema en de rollen na.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
grant usage on schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Bootst het andere product in hetzelfde project na: een tabel met dezelfde naam in public.
create table public.profiles (id uuid primary key, merkkit_veld text);
grant select, insert, update, delete on public.profiles to authenticated;
insert into public.profiles values ('99999999-9999-9999-9999-999999999999', 'van Merkkit');
