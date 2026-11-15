-- Bouwmodule, teams en het openbare profiel.
-- Voer dit één keer uit in de SQL Editor, na 0001 en 0002.

begin;

-- Voortgang in de bouwmodule: afgevinkte stappen, de ingevulde velden en de spec.
create table uitvinder.bouwmodule (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  gedaan int[] not null default '{}',
  velden jsonb not null default '{}'::jsonb,
  spec text not null default '',
  bijgewerkt_op timestamptz not null default now()
);
alter table uitvinder.bouwmodule enable row level security;
create policy bouwmodule_eigen on uitvinder.bouwmodule for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on uitvinder.bouwmodule to authenticated;
grant all on uitvinder.bouwmodule to service_role;

-- Een lid toevoegen op e-mailadres. Alleen de eigenaar van het team mag dit, en
-- alleen iemand die al een account heeft. Het adres zelf komt nergens terug.
create function uitvinder.voeg_lid_toe(t uuid, adres text, r text default 'lid') returns text
language plpgsql security definer set search_path = uitvinder as $$
declare u uuid;
begin
  if not uitvinder.is_teameigenaar(t) then
    raise exception 'Alleen de eigenaar van het team kan leden toevoegen.' using errcode = '42501';
  end if;
  if r not in ('lid', 'beoordelaar') then
    raise exception 'Onbekende rol.' using errcode = '22023';
  end if;
  select id into u from auth.users where lower(email) = lower(btrim(adres));
  if u is null then return 'geen_account'; end if;
  if exists (select 1 from memberships where team_id = t and user_id = u) then return 'al_lid'; end if;
  insert into memberships (team_id, user_id, rol) values (t, u, r);
  return 'ok';
end $$;

-- De verschuiving op een openbaar profiel: alleen datum en percentage, nooit de
-- antwoorden van de Rolscan, en alleen als de eigenaar dat onderdeel aan heeft staan.
create function uitvinder.publieke_verschuiving(s text)
returns table (datum date, pct numeric)
language sql stable security definer set search_path = uitvinder as $$
  select sc.datum, sc.pct_uitvindend
  from scans sc join profiles p on p.id = sc.user_id
  where p.slug = s and p.publiek and (p.toon ->> 'shift')::boolean
  order by sc.datum, sc.aangemaakt_op;
$$;

-- Een certificaat controleren op nummer. Geeft alleen de naam, de datum en de
-- beoordelaar terug, en alleen van een vastgestelde, voldoende beoordeling.
create function uitvinder.controleer_certificaat(nr text)
returns table (naam text, vastgesteld_op date, beoordelaar text)
language sql stable security definer set search_path = uitvinder as $$
  select p.naam, b.vastgesteld_op::date, b.beoordelaar_naam
  from beoordelingen b join profiles p on p.id = b.deelnemer_id
  where length(btrim(nr)) = 8 and upper(left(b.id::text, 8)) = upper(btrim(nr))
    and b.vastgesteld_op is not null and b.cijfer >= 5.5;
$$;
revoke execute on function uitvinder.controleer_certificaat(text) from public;
grant execute on function uitvinder.controleer_certificaat(text) to anon, authenticated, service_role;

revoke execute on function uitvinder.voeg_lid_toe(uuid, text, text) from public, anon;
grant execute on function uitvinder.voeg_lid_toe(uuid, text, text) to authenticated, service_role;
revoke execute on function uitvinder.publieke_verschuiving(text) from public;
grant execute on function uitvinder.publieke_verschuiving(text) to anon, authenticated, service_role;

commit;
