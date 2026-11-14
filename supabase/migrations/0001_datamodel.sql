-- Van uitvoerder naar uitvinder: datamodel met row level security.
-- Bron: BOUWEN-IN-CODE.md (Datamodel) en de privacyregel uit spec.md.
--
-- Privacyregel: de eigenaar van een team ziet nooit rolscan-antwoorden,
-- invalshoek-versies of privékaarten. Alleen percentages (via de functie
-- team_percentages) en wat met het team is gedeeld.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tabellen
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  naam text not null default '',
  rol text not null default 'anders'
    check (rol in ('designer', 'copywriter', 'marketeer', 'strateeg', 'anders')),
  agency text,
  -- Gekozen bij de start. Ondernemers krijgen deels andere inhoud (administratie, ontzorging).
  ondernemer boolean not null default false,
  slug text unique,
  publiek boolean not null default false,
  -- zichtbaarheid per onderdeel van het openbare profiel
  toon jsonb not null default '{"inv": true, "shift": true, "exps": true}'::jsonb,
  aangemaakt_op timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  aangemaakt_door uuid not null default auth.uid() references auth.users (id),
  aangemaakt_op timestamptz not null default now()
);

create table public.memberships (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rol text not null default 'lid' check (rol in ('lid', 'eigenaar', 'beoordelaar')),
  mag_koppelen boolean not null default false,
  sinds timestamptz not null default now(),
  primary key (team_id, user_id)
);
create index on public.memberships (user_id);

-- Beheer: alleen Thijs. Geen policies, dus alleen te vullen via de SQL-editor
-- of de service role.
create table public.beheerders (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  datum date not null default current_date,
  rol text,
  uitkomst jsonb not null,            -- privé: taken, antwoorden, experiment
  pct_uitvindend numeric(5, 2) not null check (pct_uitvindend between 0 and 100),
  aangemaakt_op timestamptz not null default now()
);
create index on public.scans (user_id, datum);

-- Werkversie van de invalshoek (één rij per gebruiker). Staat niet in het
-- overzicht van het datamodel, maar is nodig omdat het profiel zichtbaar is
-- voor teamleden en de invalshoek niet.
create table public.invalshoeken (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  vak text not null default '',
  buiten text not null default '',
  voorwie text not null default '',
  zin text not null default '',
  bijgewerkt_op timestamptz not null default now()
);

create table public.invalshoek_versies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  zin text not null check (length(btrim(zin)) > 0),
  datum date not null default current_date,
  week int not null default 1 check (week between 1 and 12)
);
create index on public.invalshoek_versies (user_id, datum);

create table public.klanten (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  team_id uuid references public.teams (id) on delete set null,
  naam text not null,
  sector text,
  merk text,
  doelgroep text,
  kanalen text[] not null default '{}',
  aangemaakt_op timestamptz not null default now()
);
create index on public.klanten (team_id);

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  team_id uuid references public.teams (id) on delete set null,
  klant_id uuid references public.klanten (id) on delete set null,
  auteur text not null default '',
  klant text not null default '',
  titel text not null default '',
  signaal text not null default '',
  waarom text not null default '',
  hypothese text not null default '',
  keuze text not null default '',     -- "Waarom deze keuze?"
  bouw text not null default '',
  tool text not null default '',
  spec text not null default '',
  link text not null default '',
  meting text not null default '',
  uitkomst text not null default '',
  geleerd text not null default '',
  zichtbaarheid text not null default 'prive'
    check (zichtbaarheid in ('prive', 'team', 'publiek')),
  status text not null default 'bezig' check (status in ('bezig', 'af')),
  remix_van uuid references public.experiments (id) on delete set null,
  remix_titel text,
  remix_auteur text,
  -- Gezet als een tool of de cockpit de ronde aanmaakt (toolcontract, stap 5).
  bron_tool text,
  week int not null default 1,
  datum date not null default current_date,
  aangemaakt_op timestamptz not null default now(),
  -- Acceptatietest toolcontract: een ronde uit een tool zonder keuze mislukt.
  constraint ronde_uit_tool_vraagt_keuze
    check (bron_tool is null or length(btrim(keuze)) > 0),
  -- Zelfde regel als in het prototype: afronden vraagt hypothese en uitkomst.
  constraint afronden_vraagt_hypothese_en_uitkomst
    check (status <> 'af' or (length(btrim(hypothese)) > 0 and length(btrim(uitkomst)) > 0))
);
create index on public.experiments (user_id, datum);
create index on public.experiments (team_id) where zichtbaarheid = 'team';

create table public.metingen (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  week int not null check (week in (1, 6, 12)),
  scores jsonb not null,              -- scores per dimensie
  pct_rolscan numeric(5, 2),
  datum date not null default current_date,
  unique (user_id, week)
);

create table public.portfolio (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  experiment_ids uuid[] not null default '{}'
    check (coalesce(array_length(experiment_ids, 1), 0) <= 3),
  bijgewerkt_op timestamptz not null default now()
);

create table public.eindopdrachten (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  pitch_link text not null default '',
  reflectie text not null default '',
  ingediend_op timestamptz
);

create table public.beoordelingen (
  id uuid primary key default gen_random_uuid(),
  deelnemer_id uuid not null references auth.users (id) on delete cascade,
  beoordelaar_id uuid not null default auth.uid() references auth.users (id),
  scores jsonb not null default '{}'::jsonb,   -- per criterium uit de rubric
  cijfer numeric(3, 1) check (cijfer between 1 and 10),
  tweede_beoordelaar boolean not null default false,
  vastgesteld_op timestamptz,
  aangemaakt_op timestamptz not null default now(),
  unique (deelnemer_id, beoordelaar_id),
  check (deelnemer_id <> beoordelaar_id)
);

create table public.koppelingen (
  id uuid primary key default gen_random_uuid(),
  klant_id uuid not null references public.klanten (id) on delete cascade,
  tool text not null,
  status text not null default 'uit' check (status in ('uit', 'aangevraagd', 'actief', 'fout')),
  toegang_versleuteld text,           -- versleuteld door de server, nooit leesbaar in de client
  unique (klant_id, tool)
);

-- Cockpit. Geen agent publiceert, betaalt of verschuift budget: een taak komt
-- in "klaar" en vraagt goedkeuren, bijsturen of stoppen, altijd met een reden.
create table public.taken (
  id uuid primary key default gen_random_uuid(),
  klant_id uuid not null references public.klanten (id) on delete cascade,
  agent text not null,
  tool text,
  titel text not null,
  aanleiding text not null default '',
  opties jsonb not null default '[]'::jsonb,
  uren numeric(5, 2),
  status text not null default 'bezig'
    check (status in ('bezig', 'klaar', 'goedgekeurd', 'gestopt')),
  besluit text not null default '',
  historie jsonb not null default '[]'::jsonb,
  besloten_door uuid references auth.users (id),
  aangemaakt_op timestamptz not null default now(),
  -- Acceptatietest cockpit: goedkeuren of stoppen zonder reden mislukt.
  constraint besluit_vraagt_reden
    check (status not in ('goedgekeurd', 'gestopt') or length(btrim(besluit)) > 0)
);
create index on public.taken (klant_id, status);

create table public.trends (
  id uuid primary key default gen_random_uuid(),
  titel text not null,
  bron text,
  momentum text,
  sectoren text[] not null default '{}',
  uitleg text not null default '',
  wat_je_kunt_doen text not null default '',
  datum date not null default current_date
);

create table public.zetten (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('gestart', 'doorgebouwd', 'gestopt')),
  titel text not null,
  wat text not null default '',
  waarom text not null default '',
  uitkomst text not null default '',
  link text not null default '',
  trend_id uuid references public.trends (id) on delete set null,
  datum date not null default current_date
);

create table public.watchlist (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  sectoren text[] not null default '{}'
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('founding', 'halfjaar', 'jaar', 'team')),
  start date not null default current_date,
  einde date                           -- leeg bij founding member (lifetime)
);
create index on public.subscriptions (user_id);

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  datum timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Hulpfuncties voor de policies. Security definer, zodat policies op
-- memberships niet naar zichzelf verwijzen.
-- ---------------------------------------------------------------------------

create function public.is_beheer() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from beheerders where user_id = auth.uid());
$$;

create function public.is_teamlid(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships where team_id = t and user_id = auth.uid());
$$;

create function public.is_teameigenaar(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships
    where team_id = t and user_id = auth.uid() and rol = 'eigenaar');
$$;

create function public.deelt_team_met(u uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships mij
    join memberships ander on ander.team_id = mij.team_id
    where mij.user_id = auth.uid() and ander.user_id = u);
$$;

-- Ben ik beoordelaar in een team waar deze deelnemer lid van is?
create function public.is_beoordelaar_van(u uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships mij
    join memberships ander on ander.team_id = mij.team_id
    where mij.user_id = auth.uid() and mij.rol = 'beoordelaar'
      and ander.user_id = u and ander.user_id <> mij.user_id);
$$;

-- Zit deze kaart in het portfolio van iemand die ik beoordeel?
create function public.in_portfolio_voor_mij(exp uuid, eigenaar uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_beoordelaar_van(eigenaar) and exists (
    select 1 from portfolio p
    where p.user_id = eigenaar and exp = any (p.experiment_ids));
$$;

create function public.klant_toegang(k uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from klanten
    where id = k and (user_id = auth.uid()
      or (team_id is not null and public.is_teamlid(team_id))));
$$;

create function public.mag_koppelen(k uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from klanten kl
    where kl.id = k and (
      (kl.team_id is null and kl.user_id = auth.uid())
      or exists (
        select 1 from memberships m
        where m.team_id = kl.team_id and m.user_id = auth.uid()
          and (m.rol = 'eigenaar' or m.mag_koppelen))));
$$;

-- Het enige wat een team-eigenaar van de Rolscan ziet: percentages per lid.
create function public.team_percentages(t uuid)
returns table (user_id uuid, naam text, rol text, nulmeting numeric, laatste numeric)
language sql stable security definer set search_path = public as $$
  select m.user_id, p.naam, p.rol,
    (select s.pct_uitvindend from scans s where s.user_id = m.user_id
      order by s.datum, s.aangemaakt_op limit 1),
    (select s.pct_uitvindend from scans s where s.user_id = m.user_id
      order by s.datum desc, s.aangemaakt_op desc limit 1)
  from memberships m
  join profiles p on p.id = m.user_id
  where m.team_id = t and public.is_teameigenaar(t);
$$;

-- Wie een team aanmaakt, wordt eigenaar.
create function public.maak_eigenaar() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into memberships (team_id, user_id, rol) values (new.id, new.aangemaakt_door, 'eigenaar');
  return new;
end $$;
create trigger team_eigenaar after insert on public.teams
  for each row execute function public.maak_eigenaar();

-- Een kaart kan alleen met een team gedeeld worden waar de maker lid van is.
create function public.controleer_team() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.team_id is not null and not exists (
    select 1 from memberships where team_id = new.team_id and user_id = new.user_id) then
    raise exception 'Je bent geen lid van dit team.' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger experiment_team before insert or update of team_id, user_id on public.experiments
  for each row execute function public.controleer_team();
create trigger klant_team before insert or update of team_id, user_id on public.klanten
  for each row execute function public.controleer_team();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.memberships enable row level security;
alter table public.beheerders enable row level security;
alter table public.scans enable row level security;
alter table public.invalshoeken enable row level security;
alter table public.invalshoek_versies enable row level security;
alter table public.klanten enable row level security;
alter table public.experiments enable row level security;
alter table public.metingen enable row level security;
alter table public.portfolio enable row level security;
alter table public.eindopdrachten enable row level security;
alter table public.beoordelingen enable row level security;
alter table public.koppelingen enable row level security;
alter table public.taken enable row level security;
alter table public.trends enable row level security;
alter table public.zetten enable row level security;
alter table public.watchlist enable row level security;
alter table public.subscriptions enable row level security;
alter table public.waitlist enable row level security;

-- profiles: eigenaar; teamleden zien naam en rol; publiek alleen als aangezet.
create policy profiel_lezen on public.profiles for select
  using (id = auth.uid() or publiek or public.deelt_team_met(id));
create policy profiel_maken on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy profiel_wijzigen on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- teams en memberships: leden van het team.
create policy team_lezen on public.teams for select to authenticated
  using (public.is_teamlid(id) or aangemaakt_door = auth.uid());
create policy team_maken on public.teams for insert to authenticated
  with check (aangemaakt_door = auth.uid());
create policy team_wijzigen on public.teams for update to authenticated
  using (public.is_teameigenaar(id)) with check (public.is_teameigenaar(id));
create policy team_verwijderen on public.teams for delete to authenticated
  using (public.is_teameigenaar(id));

create policy lid_lezen on public.memberships for select to authenticated
  using (public.is_teamlid(team_id));
create policy lid_toevoegen on public.memberships for insert to authenticated
  with check (public.is_teameigenaar(team_id));
create policy lid_wijzigen on public.memberships for update to authenticated
  using (public.is_teameigenaar(team_id)) with check (public.is_teameigenaar(team_id));
create policy lid_verwijderen on public.memberships for delete to authenticated
  using (public.is_teameigenaar(team_id) or user_id = auth.uid());

-- scans: alleen de gebruiker. De eigenaar gebruikt team_percentages().
create policy scan_eigen on public.scans for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- invalshoek: alleen de gebruiker, tenzij publiek gemaakt op het profiel.
create policy invalshoek_eigen on public.invalshoeken for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy invalshoek_publiek on public.invalshoeken for select
  using (exists (select 1 from public.profiles p
    where p.id = user_id and p.publiek and (p.toon ->> 'inv')::boolean));
create policy versie_eigen on public.invalshoek_versies for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- experiments: volgens zichtbaarheid. Privé blijft privé, ook voor de eigenaar.
create policy kaart_lezen on public.experiments for select
  using (
    user_id = auth.uid()
    or zichtbaarheid = 'publiek'
    or (zichtbaarheid = 'team' and team_id is not null and public.is_teamlid(team_id))
    or public.in_portfolio_voor_mij(id, user_id));
create policy kaart_maken on public.experiments for insert to authenticated
  with check (user_id = auth.uid());
create policy kaart_wijzigen on public.experiments for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy kaart_verwijderen on public.experiments for delete to authenticated
  using (user_id = auth.uid());

-- metingen, portfolio, eindopdrachten: gebruiker en beoordelaar.
create policy meting_lezen on public.metingen for select to authenticated
  using (user_id = auth.uid() or public.is_beoordelaar_van(user_id));
create policy meting_maken on public.metingen for insert to authenticated
  with check (user_id = auth.uid());
create policy meting_wijzigen on public.metingen for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy meting_verwijderen on public.metingen for delete to authenticated
  using (user_id = auth.uid());

create policy portfolio_lezen on public.portfolio for select to authenticated
  using (user_id = auth.uid() or public.is_beoordelaar_van(user_id));
create policy portfolio_maken on public.portfolio for insert to authenticated
  with check (user_id = auth.uid());
create policy portfolio_wijzigen on public.portfolio for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy eind_lezen on public.eindopdrachten for select to authenticated
  using (user_id = auth.uid()
    or (ingediend_op is not null and public.is_beoordelaar_van(user_id)));
create policy eind_maken on public.eindopdrachten for insert to authenticated
  with check (user_id = auth.uid());
create policy eind_wijzigen on public.eindopdrachten for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- beoordelingen: beoordelaars, en de deelnemer pas na vaststelling.
create policy beoordeling_lezen on public.beoordelingen for select to authenticated
  using (beoordelaar_id = auth.uid()
    or public.is_beoordelaar_van(deelnemer_id)
    or (deelnemer_id = auth.uid() and vastgesteld_op is not null));
create policy beoordeling_maken on public.beoordelingen for insert to authenticated
  with check (beoordelaar_id = auth.uid() and public.is_beoordelaar_van(deelnemer_id));
create policy beoordeling_wijzigen on public.beoordelingen for update to authenticated
  using (beoordelaar_id = auth.uid() and vastgesteld_op is null)
  with check (beoordelaar_id = auth.uid());

-- klanten en taken: de maker en de leden van het team.
create policy klant_lezen on public.klanten for select to authenticated
  using (user_id = auth.uid() or (team_id is not null and public.is_teamlid(team_id)));
create policy klant_maken on public.klanten for insert to authenticated
  with check (user_id = auth.uid());
create policy klant_wijzigen on public.klanten for update to authenticated
  using (user_id = auth.uid() or (team_id is not null and public.is_teamlid(team_id)))
  with check (user_id = auth.uid() or (team_id is not null and public.is_teamlid(team_id)));
create policy klant_verwijderen on public.klanten for delete to authenticated
  using (user_id = auth.uid() or (team_id is not null and public.is_teameigenaar(team_id)));

create policy taak_alles on public.taken for all to authenticated
  using (public.klant_toegang(klant_id)) with check (public.klant_toegang(klant_id));

-- koppelingen: team-eigenaar en leden met rechten.
create policy koppeling_alles on public.koppelingen for all to authenticated
  using (public.mag_koppelen(klant_id)) with check (public.mag_koppelen(klant_id));

-- trends en zetten: iedereen met een account leest; alleen beheer (Thijs) schrijft.
create policy trend_lezen on public.trends for select to authenticated using (true);
create policy trend_beheer on public.trends for all to authenticated
  using (public.is_beheer()) with check (public.is_beheer());
create policy zet_lezen on public.zetten for select to authenticated using (true);
create policy zet_beheer on public.zetten for all to authenticated
  using (public.is_beheer()) with check (public.is_beheer());

create policy watch_eigen on public.watchlist for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- subscriptions: gebruiker leest, beheer leest. Schrijven alleen via de server
-- (service role, na een geslaagde betaling).
create policy abonnement_lezen on public.subscriptions for select to authenticated
  using (user_id = auth.uid() or public.is_beheer());

-- waitlist: iedereen mag zich aanmelden, alleen beheer leest.
create policy wachtlijst_aanmelden on public.waitlist for insert to anon, authenticated
  with check (true);
create policy wachtlijst_lezen on public.waitlist for select to authenticated
  using (public.is_beheer());

-- beheerders: geen policies. Eigen rij lezen loopt via is_beheer().

-- ---------------------------------------------------------------------------
-- Rechten. RLS bepaalt welke rijen; dit bepaalt welke rollen er überhaupt bij mogen.
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke all on public.beheerders from authenticated;
revoke insert, update, delete on public.subscriptions from authenticated;
-- Zonder account: openbare profielen met hun publieke kaarten, en de wachtlijst.
grant select on public.profiles, public.invalshoeken, public.experiments to anon;
grant insert on public.waitlist to anon;

revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;
grant execute on function public.is_teamlid(uuid), public.in_portfolio_voor_mij(uuid, uuid),
  public.is_beoordelaar_van(uuid), public.deelt_team_met(uuid) to anon;
