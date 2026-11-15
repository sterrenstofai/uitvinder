-- Beoordelen en certificaat.
--
-- In de testfase is er nog geen scherm om teams en beoordelaars in te richten.
-- Daarom mag ook een beheerder (Thijs) beoordelen, maar alleen wat een deelnemer
-- zelf heeft ingediend. Rolscan-antwoorden, invalshoek en privékaarten buiten het
-- portfolio blijven ook voor de beheerder dicht.
--
-- Voer dit één keer uit in de SQL Editor, na 0001_datamodel.sql.

begin;

-- De naam van de beoordelaar komt op het certificaat. De deelnemer kan het
-- profiel van de beoordelaar niet lezen, dus de naam wordt hier vastgelegd.
alter table uitvinder.beoordelingen add column beoordelaar_naam text;

create function uitvinder.mag_beoordelen(u uuid) returns boolean
language sql stable security definer set search_path = uitvinder as $$
  select uitvinder.is_beoordelaar_van(u)
    or (uitvinder.is_beheer() and u <> auth.uid() and exists (
      select 1 from eindopdrachten e where e.user_id = u and e.ingediend_op is not null));
$$;

-- Zit deze kaart in het portfolio van iemand die ik mag beoordelen?
create or replace function uitvinder.in_portfolio_voor_mij(exp uuid, eigenaar uuid) returns boolean
language sql stable security definer set search_path = uitvinder as $$
  select uitvinder.mag_beoordelen(eigenaar) and exists (
    select 1 from portfolio p
    where p.user_id = eigenaar and exp = any (p.experiment_ids));
$$;

drop policy profiel_lezen on uitvinder.profiles;
create policy profiel_lezen on uitvinder.profiles for select
  using (id = auth.uid() or publiek or uitvinder.deelt_team_met(id) or uitvinder.mag_beoordelen(id));

drop policy meting_lezen on uitvinder.metingen;
create policy meting_lezen on uitvinder.metingen for select to authenticated
  using (user_id = auth.uid() or uitvinder.mag_beoordelen(user_id));

drop policy portfolio_lezen on uitvinder.portfolio;
create policy portfolio_lezen on uitvinder.portfolio for select to authenticated
  using (user_id = auth.uid() or uitvinder.mag_beoordelen(user_id));

drop policy eind_lezen on uitvinder.eindopdrachten;
create policy eind_lezen on uitvinder.eindopdrachten for select to authenticated
  using (user_id = auth.uid()
    or (ingediend_op is not null and uitvinder.mag_beoordelen(user_id)));

-- Na het indienen ligt de inzending vast: de deelnemer kan hem niet meer wijzigen.
drop policy eind_wijzigen on uitvinder.eindopdrachten;
create policy eind_wijzigen on uitvinder.eindopdrachten for update to authenticated
  using (user_id = auth.uid() and ingediend_op is null) with check (user_id = auth.uid());
drop policy portfolio_wijzigen on uitvinder.portfolio;
create policy portfolio_wijzigen on uitvinder.portfolio for update to authenticated
  using (user_id = auth.uid() and not exists (
    select 1 from uitvinder.eindopdrachten e where e.user_id = auth.uid() and e.ingediend_op is not null))
  with check (user_id = auth.uid());

drop policy beoordeling_lezen on uitvinder.beoordelingen;
create policy beoordeling_lezen on uitvinder.beoordelingen for select to authenticated
  using (beoordelaar_id = auth.uid()
    or uitvinder.mag_beoordelen(deelnemer_id)
    or (deelnemer_id = auth.uid() and vastgesteld_op is not null));

drop policy beoordeling_maken on uitvinder.beoordelingen;
create policy beoordeling_maken on uitvinder.beoordelingen for insert to authenticated
  with check (beoordelaar_id = auth.uid() and uitvinder.mag_beoordelen(deelnemer_id));

revoke execute on function uitvinder.mag_beoordelen(uuid) from public;
grant execute on function uitvinder.mag_beoordelen(uuid) to anon, authenticated, service_role;

commit;
