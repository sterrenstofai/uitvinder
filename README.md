# Van uitvoerder naar uitvinder

Het platform van Thijs Mensink. Lees eerst `CLAUDE.md`, dan `BOUWEN-IN-CODE.md` en `spec.md`.

Live: https://uitvinder-platform.netlify.app (Netlify-project `uitvinder-platform`, nu in voorbeeldmodus). Het project is nog niet aan deze repo gekoppeld: de eerste deploy is geüpload. Koppel de repo in Netlify bij Project configuration, Build & deploy, zodat elke push naar `main` vanzelf live gaat.

## Wat er staat (stap 1 van de bouwvolgorde)

| Onderdeel | Stand |
| --- | --- |
| Next.js met TypeScript, klaar voor Netlify | Staat. `npm run build` slaagt. |
| Datamodel met row level security | Staat in `supabase/migrations/0001_datamodel.sql`. Alle tabellen uit `BOUWEN-IN-CODE.md`. |
| Privacyregel | Getest met 39 tests in `supabase/tests/rls_test.sql`, tegen een lokale Postgres 16. |
| Login met magic link | Gebouwd, nog niet getest tegen een echt Supabase-project (dat bestaat nog niet). |
| Schermen Vandaag, Reis, Invalshoek, Ronde (stap 3 tot en met 5) | Overgezet, met de proeftuinen en de coach. In de browser doorlopen in voorbeeldmodus. |
| Lessen | Komen uit `content/*.md`. Het `LES`-object uit het prototype is niet overgenomen. |
| Gegevens uit het prototype overnemen | Bij de eerste keer inloggen, als er prototype-gegevens op het apparaat staan. |
| AI-functies `scan` en `coach` | Ongewijzigd in `netlify/functions`. |

Zonder Supabase-sleutels draait het platform in **voorbeeldmodus**: je gaat zonder mail verder en de gegevens blijven op het apparaat, zoals in het prototype. Zo is elke deploy te bekijken.

## Koppelen (eenmalig, in de browser)

1. **Supabase.** Maak een project in de regio Frankfurt (EU). Open de SQL-editor, plak `supabase/migrations/0001_datamodel.sql` en voer uit.
2. **Supabase, Authentication, URL Configuration.** Zet de Site URL op het adres van de Netlify-site en voeg `https://<site>/auth/callback` toe bij Redirect URLs.
3. **Netlify.** Zet in het project `uitvinder-platform` bij Environment variables `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase, Project Settings, API) en deploy opnieuw. De AI Gateway van Netlify regelt de sleutel voor de AI-functies.
4. **Beheer.** Log één keer in en voeg jezelf dan toe als beheerder in de SQL-editor: `insert into beheerders (user_id) select id from auth.users where email = '<jouw adres>';`

De magic links van Supabase zijn zonder eigen mailserver beperkt tot een paar per uur. Voor de lancering is een eigen SMTP-dienst nodig.

## Nog niet overgezet

Deze schermen wijzen in het platform naar het prototype (`/prototype/index.html`): voorkant, Rolscan, metingen, Cockpit, Klantdossier, Markt, Bouwen, Library met de drie tools, Portfolio, Beoordeling, Profiel en Team.

Gevolgen in wat er nu staat:

- Zonder Rolscan is er geen nulmeting, tenzij je gegevens uit het prototype overneemt. Vandaag en Reis tonen dan een streepje.
- Vandaag slaat de metingen en de eindopdracht over als volgende stap, en toont de cockpit en de markt als leeg vak.
- De proeftuin bij de invalshoek (Eigen of inwisselbaar?) is nog niet overgezet.
- Een kaart delen met je team werkt in de database, maar er is nog geen scherm om een team te maken of leden uit te nodigen.

## Open punten uit deze stap

- **Lettertype.** Neue Montreal laadt niet: thijsmensink.nl stuurt geen CORS-header mee, dus de browser valt terug op Inter. Oplossing: één header op thijsmensink.nl, of de fontbestanden in deze repo (let op de licentie).
- **Rate limit en login op de AI-functies.** `/api/coach` en `/api/scan` zijn nog open voor iedereen die het adres kent, net als in het prototype.
- **Regio van de functies.** De Netlify-functies (coach en scan) draaien nu in de VS. Voor "data in de EU" moet de regio in Netlify op Frankfurt.
- **Oefenmateriaal van de proeftuinen** staat in `lib/proeftuin.ts`, overgenomen uit het prototype. Hoort in stap 2 naar `content/`.
- **Beoordelaar.** Besloten: een team-eigenaar mag ook beoordelaar zijn. Een beoordelaar ziet de drie portfoliokaarten en de metingen van een deelnemer, ook als die kaarten privé zijn. Rolscan-antwoorden en invalshoek blijven ook dan dicht.

## Ontzorging voor ondernemers (inzicht van 14 november 2026)

Het inzicht staat in `spec.md`. De keuze bij de start is gebouwd, de ontzorging zelf nog niet. Wat het raakt:

- **Doelgroep.** Besloten: ondernemers komen erbij. Bij de start kies je of je in een team werkt of als ondernemer; dat staat op het profiel en verandert een deel van de inhoud. Welke inhoud precies, moet Thijs nog aanleveren.
- **Doeltoets.** Administratie draagt niet zelf bij aan de mindsetswitch (vraag 1) en hangt aan geen van de vijf leeruitkomsten (vraag 2). Het neemt wel een drempel weg. Voorstel: bouw het als dienst naast de reis, buiten de 56 uur en buiten de toetsing, en niet als les.
- **Past bij regel 3.** De tool doet het uitvoerende werk, de mens het oordeel: een administratie-agent in de cockpit zet facturen klaar in Moneybird, jij keurt goed met een reden. Versturen en betalen gebeurt nooit zonder akkoord. De tabellen `koppelingen` en `taken` zijn daar al op ingericht.
- **Grens.** Potjes voor btw en inkomstenbelasting uitrekenen is een rekenhulp, geen belastingadvies. Dat moet er zichtbaar bij staan, en de bedragen en percentages moeten uit een bron komen die elk jaar wordt bijgewerkt.
- **Inhoud.** Uitleg over ondernemen is lesstof en komt dus van Thijs, in `content/`.

## Lokaal draaien en testen

```
npm install
npm run dev
```

De privacytests draaien tegen een lege Postgres met het nagebootste auth-schema uit `supabase/tests/00_auth_stub.sql`:

```
psql -d test -f supabase/tests/00_auth_stub.sql
psql -d test -f supabase/migrations/0001_datamodel.sql
psql -d test -v ON_ERROR_STOP=1 -f supabase/tests/rls_test.sql
```
