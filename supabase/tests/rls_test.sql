-- Test van de privacyregel en de acceptatietests. Draai na de migratie.
-- Elke "verwacht" regel geeft een fout als het niet klopt.
\set ON_ERROR_STOP on
set search_path = uitvinder;
\set anna  '''11111111-1111-1111-1111-111111111111'''
\set bram  '''22222222-2222-2222-2222-222222222222'''
\set eva   '''33333333-3333-3333-3333-333333333333'''
\set buiten '''44444444-4444-4444-4444-444444444444'''
\set bo    '''55555555-5555-5555-5555-555555555555'''

create schema tst;
create function tst.verwacht(ok boolean, wat text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'MISLUKT: %', wat; end if;
  raise notice 'ok: %', wat;
end $$;
create function tst.faalt(q text, wat text) returns void language plpgsql as $$
begin
  begin execute q; exception when others then
    raise notice 'ok: % (%)', wat, sqlerrm; return; end;
  raise exception 'MISLUKT, had moeten falen: %', wat;
end $$;
grant usage on schema tst to anon, authenticated;

insert into auth.users (id) values (:anna), (:bram), (:eva), (:buiten), (:bo);

-- Eva (eigenaar) maakt een team; Anna en Bram zijn lid, Bo is beoordelaar.
set role authenticated;
set request.jwt.claim.sub = :eva;
insert into profiles (id, naam, rol) values (:eva, 'Eva Eigenaar', 'strateeg');
insert into teams (id, naam) values ('aaaaaaaa-0000-0000-0000-000000000000', 'Studio Test');
insert into memberships (team_id, user_id) values
  ('aaaaaaaa-0000-0000-0000-000000000000', :anna),
  ('aaaaaaaa-0000-0000-0000-000000000000', :bram);
insert into memberships (team_id, user_id, rol) values
  ('aaaaaaaa-0000-0000-0000-000000000000', :bo, 'beoordelaar');
select tst.verwacht((select rol from memberships where user_id = :eva) = 'eigenaar',
  'wie een team maakt, wordt eigenaar');

-- Anna vult haar eigen gegevens.
set request.jwt.claim.sub = :anna;
insert into profiles (id, naam, rol, ondernemer) values (:anna, 'Anna Lid', 'designer', true);
insert into scans (uitkomst, pct_uitvindend, datum) values
  ('{"taken":[{"taak":"geheim"}]}', 18, '2026-09-01'),
  ('{"taken":[{"taak":"geheim 2"}]}', 31, '2026-10-15');
insert into invalshoeken (zin) values ('Ik ontwerp voor bakkers, omdat ik bakker was.');
insert into invalshoek_versies (zin) values ('Ik ontwerp voor bakkers, omdat ik bakker was.');
insert into experiments (id, titel, zichtbaarheid) values
  ('e0000000-0000-0000-0000-000000000001', 'Privékaart', 'prive');
insert into experiments (id, titel, zichtbaarheid, team_id) values
  ('e0000000-0000-0000-0000-000000000002', 'Teamkaart', 'team', 'aaaaaaaa-0000-0000-0000-000000000000');
insert into experiments (id, titel, zichtbaarheid) values
  ('e0000000-0000-0000-0000-000000000003', 'Publieke kaart', 'publiek');
insert into experiments (id, titel, zichtbaarheid) values
  ('e0000000-0000-0000-0000-000000000004', 'Privé, maar in portfolio', 'prive');
insert into portfolio (experiment_ids) values ('{e0000000-0000-0000-0000-000000000004}');
insert into metingen (week, scores) values (1, '{"gen": 2.3}');
insert into administratie (belasting_pct, stappen_af, bedrijf) values (35, '{inschrijven-bij-de-kvk}', '{"iban": "NL00TEST"}');
select tst.verwacht((select count(*) from experiments) = 4, 'Anna ziet haar vier kaarten');

-- De eigenaar: nooit antwoorden, invalshoek of privékaarten. Wel percentages en teamkaarten.
set request.jwt.claim.sub = :eva;
select tst.verwacht((select count(*) from scans) = 0, 'eigenaar ziet geen rolscan-antwoorden');
select tst.verwacht((select count(*) from invalshoeken) = 0, 'eigenaar ziet geen invalshoek');
select tst.verwacht((select count(*) from invalshoek_versies) = 0, 'eigenaar ziet geen invalshoek-versies');
select tst.verwacht((select array_agg(titel order by titel) from experiments) = '{"Publieke kaart",Teamkaart}',
  'eigenaar ziet alleen de teamkaart en de publieke kaart');
select tst.verwacht((select count(*) from metingen) = 0, 'eigenaar ziet geen metingen');
select tst.verwacht((select count(*) from administratie) = 0, 'eigenaar ziet geen administratie van een lid');
select tst.verwacht((select count(*) from portfolio) = 0, 'eigenaar ziet geen portfolio');
select tst.verwacht(
  (select (nulmeting, laatste) = (18::numeric, 31::numeric) from team_percentages('aaaaaaaa-0000-0000-0000-000000000000') where user_id = :anna),
  'eigenaar ziet wel de percentages: nulmeting 18, laatste 31');
select tst.verwacht((select naam from profiles where id = :anna) = 'Anna Lid', 'eigenaar ziet naam en rol van een teamlid');
update experiments set titel = 'gekaapt' where id = 'e0000000-0000-0000-0000-000000000002';
select tst.verwacht((select titel from experiments where id = 'e0000000-0000-0000-0000-000000000002') = 'Teamkaart',
  'eigenaar kan de kaart van een lid niet wijzigen');

-- Teamlid Bram: teamkaart wel, privé niet, en geen percentages.
set request.jwt.claim.sub = :bram;
select tst.verwacht((select array_agg(titel order by titel) from experiments) = '{"Publieke kaart",Teamkaart}',
  'teamlid ziet de teamkaart en de publieke kaart');
select tst.verwacht((select count(*) from team_percentages('aaaaaaaa-0000-0000-0000-000000000000')) = 0,
  'een gewoon lid krijgt geen percentages van anderen');
select tst.faalt($q$insert into scans (user_id, uitkomst, pct_uitvindend) values ('11111111-1111-1111-1111-111111111111', '{}', 99)$q$,
  'een scan op naam van een ander maken mislukt');
select tst.faalt($q$insert into memberships (team_id, user_id, rol) values ('aaaaaaaa-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'eigenaar')$q$,
  'een lid kan geen leden toevoegen');

-- Beoordelaar Bo: portfolio, metingen en de gekozen kaart, ook al is die privé.
set request.jwt.claim.sub = :bo;
select tst.verwacht((select count(*) from portfolio) = 1, 'beoordelaar ziet het portfolio');
select tst.verwacht((select count(*) from metingen) = 1, 'beoordelaar ziet de metingen');
select tst.verwacht(exists (select 1 from experiments where titel = 'Privé, maar in portfolio'),
  'beoordelaar ziet de portfoliokaart');
select tst.verwacht(not exists (select 1 from experiments where titel = 'Privékaart'),
  'beoordelaar ziet de andere privékaart niet');
select tst.verwacht((select count(*) from scans) = 0, 'beoordelaar ziet geen rolscan-antwoorden');
select tst.verwacht((select count(*) from administratie) = 0, 'beoordelaar ziet geen administratie');
insert into beoordelingen (deelnemer_id, scores, cijfer) values (:anna, '{"signaal": 3}', 7.5);
set request.jwt.claim.sub = :anna;
select tst.verwacht((select count(*) from beoordelingen) = 0, 'deelnemer ziet de beoordeling niet voor vaststelling');
set request.jwt.claim.sub = :bo;
update beoordelingen set vastgesteld_op = now();
set request.jwt.claim.sub = :anna;
select tst.verwacht((select count(*) from beoordelingen) = 1, 'deelnemer ziet de beoordeling na vaststelling');
select tst.faalt($q$insert into beoordelingen (deelnemer_id, beoordelaar_id, cijfer) values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 10)$q$,
  'een deelnemer kan niemand beoordelen');

-- Buitenstaander met account: alleen publiek.
set request.jwt.claim.sub = :buiten;
select tst.verwacht((select array_agg(titel) from experiments) = '{"Publieke kaart"}', 'buitenstaander ziet alleen de publieke kaart');
select tst.verwacht((select count(*) from profiles) = 0, 'buitenstaander ziet geen besloten profielen');
select tst.verwacht((select count(*) from teams) = 0, 'buitenstaander ziet het team niet');
select tst.faalt($q$insert into experiments (titel, zichtbaarheid, team_id) values ('x', 'team', 'aaaaaaaa-0000-0000-0000-000000000000')$q$,
  'een kaart delen met een team waar je geen lid van bent mislukt');
select tst.faalt($q$insert into zetten (type, titel) values ('gestart', 'nep')$q$, 'alleen Thijs schrijft zetten');
select tst.faalt($q$insert into subscriptions (user_id, type) values ('44444444-4444-4444-4444-444444444444', 'founding')$q$,
  'een gebruiker kan zichzelf geen abonnement geven');

-- Zonder account.
reset request.jwt.claim.sub;
set role anon;
select tst.verwacht((select count(*) from experiments) = 1, 'zonder account: alleen de publieke kaart');
select tst.verwacht((select count(*) from invalshoeken) = 0, 'zonder account: geen invalshoek van een besloten profiel');
insert into waitlist (email) values ('iemand@example.com');
select tst.faalt($q$select * from waitlist$q$, 'zonder account is de wachtlijst niet te lezen');
select tst.faalt($q$select * from scans$q$, 'zonder account zijn scans niet te lezen');

-- Anna zet haar profiel open: dan is de invalshoek zichtbaar, tot ze dat onderdeel uitzet.
set role authenticated;
set request.jwt.claim.sub = :anna;
update profiles set publiek = true where id = :anna;
set role anon;
select tst.verwacht((select count(*) from invalshoeken) = 1, 'openbaar profiel toont de invalshoek');
set role authenticated;
update profiles set toon = toon || '{"inv": false}' where id = :anna;
set role anon;
select tst.verwacht((select count(*) from invalshoeken) = 0, 'invalshoek per onderdeel uit te zetten');

-- Acceptatietests.
set role authenticated;
set request.jwt.claim.sub = :anna;
select tst.faalt($q$insert into experiments (titel, bron_tool) values ('uit tool', 'concept')$q$,
  'toolcontract: een ronde uit een tool zonder keuze mislukt');
insert into experiments (titel, bron_tool, keuze) values ('uit tool', 'concept', 'Omdat deze route bij mijn invalshoek past.');
select tst.faalt($q$update experiments set status = 'af' where titel = 'Privékaart'$q$,
  'afronden zonder hypothese en uitkomst mislukt');
insert into klanten (id, naam) values ('c0000000-0000-0000-0000-000000000001', 'Fietsmerk Velo');
insert into taken (id, klant_id, agent, titel, status) values
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Design', 'Banners', 'klaar');
select tst.faalt($q$update taken set status = 'goedgekeurd'$q$, 'cockpit: goedkeuren zonder reden mislukt');
update taken set status = 'goedgekeurd', besluit = 'Past bij het signaal van deze week.';
set request.jwt.claim.sub = :bram;
select tst.verwacht((select count(*) from taken) = 0, 'taken van een klant buiten je team zie je niet');

-- Beheerder als beoordelaar (0002): alleen wat is ingediend, en nooit de privégegevens.
reset role;
insert into auth.users (id) values ('66666666-6666-6666-6666-666666666666'), ('77777777-7777-7777-7777-777777777777');
insert into uitvinder.beheerders (user_id) values ('66666666-6666-6666-6666-666666666666');
set role authenticated;
set request.jwt.claim.sub = '77777777-7777-7777-7777-777777777777';
insert into profiles (id, naam, rol) values ('77777777-7777-7777-7777-777777777777', 'Daan Deelnemer', 'marketeer');
insert into scans (uitkomst, pct_uitvindend) values ('{"taken":[{"taak":"geheim"}]}', 20);
insert into invalshoeken (zin) values ('Ik maak campagnes voor bakkers, omdat ik bakker was.');
insert into experiments (id, titel, hypothese, uitkomst, status) values
  ('e0000000-0000-0000-0000-0000000000d1', 'Daan portfoliokaart', 'Als ik..., dan...', '12 aanmeldingen', 'af'),
  ('e0000000-0000-0000-0000-0000000000d2', 'Daan privékaart', '', '', 'bezig');
insert into portfolio (experiment_ids) values ('{e0000000-0000-0000-0000-0000000000d1}');
insert into metingen (week, scores) values (12, '{"gen": 4}');
insert into eindopdrachten (pitch_link, reflectie) values ('https://example.com/pitch', 'Mijn reflectie.');
set request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';
select tst.verwacht((select count(*) from eindopdrachten) = 0, 'beheerder ziet niets zolang er niet is ingediend');
select tst.verwacht((select count(*) from portfolio where user_id = '77777777-7777-7777-7777-777777777777') = 0, 'beheerder ziet het portfolio nog niet');
select tst.faalt($q$insert into beoordelingen (deelnemer_id, cijfer) values ('77777777-7777-7777-7777-777777777777', 8)$q$,
  'beoordelen voordat er is ingediend mislukt');
set request.jwt.claim.sub = '77777777-7777-7777-7777-777777777777';
update eindopdrachten set ingediend_op = now();
update eindopdrachten set reflectie = 'Stiekem aangepast';
select tst.verwacht((select reflectie from eindopdrachten) = 'Mijn reflectie.', 'na het indienen kan de deelnemer de eindopdracht niet meer wijzigen');
update portfolio set experiment_ids = '{}';
select tst.verwacht((select array_length(experiment_ids, 1) from portfolio) = 1, 'na het indienen ligt ook het portfolio vast');
set request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';
select tst.verwacht((select reflectie from eindopdrachten where user_id = '77777777-7777-7777-7777-777777777777') = 'Mijn reflectie.', 'beheerder ziet de ingediende eindopdracht');
select tst.verwacht((select count(*) from portfolio where user_id = '77777777-7777-7777-7777-777777777777') = 1, 'beheerder ziet het ingediende portfolio');
select tst.verwacht((select count(*) from metingen where user_id = '77777777-7777-7777-7777-777777777777') = 1, 'beheerder ziet de metingen van de inzender');
select tst.verwacht(exists (select 1 from experiments where titel = 'Daan portfoliokaart'), 'beheerder ziet de portfoliokaart');
select tst.verwacht(not exists (select 1 from experiments where titel = 'Daan privékaart'), 'beheerder ziet de privékaart buiten het portfolio niet');
select tst.verwacht((select naam from profiles where id = '77777777-7777-7777-7777-777777777777') = 'Daan Deelnemer', 'beheerder ziet de naam van de inzender');
select tst.verwacht((select count(*) from scans) = 0, 'beheerder ziet geen rolscan-antwoorden');
select tst.verwacht((select count(*) from invalshoeken) = 0, 'beheerder ziet geen invalshoek');
select tst.verwacht((select count(*) from portfolio where user_id = '11111111-1111-1111-1111-111111111111') = 0, 'beheerder ziet geen portfolio dat niet is ingediend');
insert into beoordelingen (deelnemer_id, scores, cijfer, beoordelaar_naam) values ('77777777-7777-7777-7777-777777777777', '{"eind": [1, 2, 2]}', 7.2, 'Thijs Mensink');
set request.jwt.claim.sub = '77777777-7777-7777-7777-777777777777';
select tst.verwacht((select count(*) from beoordelingen) = 0, 'inzender ziet de beoordeling niet voor vaststelling');
set request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';
update beoordelingen set vastgesteld_op = now() where deelnemer_id = '77777777-7777-7777-7777-777777777777';
set request.jwt.claim.sub = '77777777-7777-7777-7777-777777777777';
select tst.verwacht((select cijfer from beoordelingen) = 7.2, 'inzender ziet het cijfer na vaststelling');
select tst.verwacht((select beoordelaar_naam from beoordelingen) = 'Thijs Mensink', 'de naam van de beoordelaar staat op de beoordeling');
update beoordelingen set cijfer = 10;
select tst.verwacht((select cijfer from beoordelingen) = 7.2, 'inzender kan het eigen cijfer niet wijzigen');

-- Teams, bouwmodule en openbaar profiel (0003).
reset role;
update auth.users set email = 'daan@example.com' where id = '77777777-7777-7777-7777-777777777777';
update auth.users set email = 'bram@example.com' where id = '22222222-2222-2222-2222-222222222222';
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select tst.faalt($q$select voeg_lid_toe('aaaaaaaa-0000-0000-0000-000000000000', 'daan@example.com')$q$, 'een gewoon lid kan niemand op e-mailadres toevoegen');
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select tst.verwacht(voeg_lid_toe('aaaaaaaa-0000-0000-0000-000000000000', 'niemand@example.com') = 'geen_account', 'een onbekend adres geeft geen_account');
select tst.verwacht(voeg_lid_toe('aaaaaaaa-0000-0000-0000-000000000000', ' Daan@Example.com ') = 'ok', 'de eigenaar voegt een lid toe op e-mailadres');
select tst.verwacht(voeg_lid_toe('aaaaaaaa-0000-0000-0000-000000000000', 'daan@example.com') = 'al_lid', 'twee keer toevoegen geeft al_lid');
select tst.faalt($q$select voeg_lid_toe('aaaaaaaa-0000-0000-0000-000000000000', 'bram@example.com', 'eigenaar')$q$, 'via deze weg kan niemand eigenaar worden');
select tst.verwacht((select count(*) from memberships where team_id = 'aaaaaaaa-0000-0000-0000-000000000000') = 5, 'het team heeft nu vijf leden');
set request.jwt.claim.sub = '77777777-7777-7777-7777-777777777777';
insert into bouwmodule (gedaan, spec) values ('{0,1}', 'Doel: ...');
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select tst.verwacht((select count(*) from bouwmodule) = 0, 'de eigenaar ziet de bouwmodule van een lid niet');
select tst.verwacht((select count(*) from scans) = 0, 'de eigenaar ziet ook van het nieuwe lid geen rolscan-antwoorden');
select tst.verwacht((select nulmeting from team_percentages('aaaaaaaa-0000-0000-0000-000000000000') where user_id = '77777777-7777-7777-7777-777777777777') = 20, 'de eigenaar ziet wel het percentage van het nieuwe lid');
-- openbaar profiel
set request.jwt.claim.sub = '77777777-7777-7777-7777-777777777777';
update profiles set slug = 'daan-deelnemer-7777' where id = '77777777-7777-7777-7777-777777777777';
reset request.jwt.claim.sub;
set role anon;
select tst.verwacht((select count(*) from publieke_verschuiving('daan-deelnemer-7777')) = 0, 'een besloten profiel toont geen verschuiving');
set role authenticated;
set request.jwt.claim.sub = '77777777-7777-7777-7777-777777777777';
update profiles set publiek = true where id = '77777777-7777-7777-7777-777777777777';
reset request.jwt.claim.sub;
set role anon;
select tst.verwacht((select pct from publieke_verschuiving('daan-deelnemer-7777')) = 20, 'een openbaar profiel toont de verschuiving als percentage');
select tst.verwacht((select naam from profiles where slug = 'daan-deelnemer-7777') = 'Daan Deelnemer', 'een openbaar profiel is zonder account te lezen');
select tst.faalt($q$select voeg_lid_toe('aaaaaaaa-0000-0000-0000-000000000000', 'bram@example.com')$q$, 'zonder account kan niemand leden toevoegen');
set role authenticated;
set request.jwt.claim.sub = '77777777-7777-7777-7777-777777777777';
update profiles set toon = toon || '{"shift": false}' where id = '77777777-7777-7777-7777-777777777777';
reset request.jwt.claim.sub;
set role anon;
select tst.verwacht((select count(*) from publieke_verschuiving('daan-deelnemer-7777')) = 0, 'de verschuiving is per onderdeel uit te zetten');

-- Het gedeelde project: de tabellen van het andere product in public blijven onaangeroerd.
set role authenticated;
set request.jwt.claim.sub = :anna;
select tst.verwacht((select merkkit_veld from public.profiles) = 'van Merkkit',
  'public.profiles van het andere product bestaat nog en is leesbaar');
select tst.verwacht((select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'ondernemer') = 0,
  'er is niets toegevoegd aan tabellen in public');

reset role;
select 'ALLE TESTS GESLAAGD' as resultaat;
