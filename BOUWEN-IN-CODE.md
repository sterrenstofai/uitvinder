# Bouwen in Claude Code — overdracht

Dit document zet het prototype om naar een echt platform. Lees het samen met `CLAUDE.md`, `spec.md`, de lessen in `content/` en het onderwijskundig kader in `docs/onderwijskundig-kader.md`.

## Drie regels die bij elke wijziging gelden

1. **De leeruitkomsten blijven staan.** Elke les, tool of functie gaat door de doeltoets uit het kader. Is één antwoord nee, dan wordt het aangepast of valt het af.
2. **Het gaat om de tools.** De library is de reden om te betalen. De reis is de reden om te blijven en te veranderen.
3. **De tool doet het uitvoerende werk, de mens het oordeel.** Geen enkele tool maakt een ronde aan zonder keuze en verantwoording van de gebruiker.

## Wat er nu staat

| Onderdeel | Prototype | Echt platform |
| --- | --- | --- |
| Frontend | Eén bestand `public/index.html`, vanilla JS, hash-routing | Framework, componenten per pagina |
| Opslag | `localStorage` in de browser | Supabase (EU), Postgres met row level security |
| Accounts | Naam invullen, geen login | Supabase Auth, e-mail met magic link |
| AI | Netlify functions `scan` en `coach` via de Netlify AI Gateway, model `claude-sonnet-5-5` | Zelfde functies, met rate limit per gebruiker |
| Lessen | Tekst staat dubbel: in `content/*.md` en in het `LES`-object in de code | Alleen `content/*.md` als bron, ingelezen bij de build |
| Video | `VIDEO`-object met lege links per stap | Veld per les in de content |
| Teamdata | Fictief voorbeeldteam in de code | Echte teams en lidmaatschappen |
| Beoordeling | Fictieve inzending, scores in het geheugen | Rol beoordelaar, scores opgeslagen, tweede beoordelaar |
| Betalen | Prijzen alleen getoond | Mollie of Stripe met iDEAL |
| Meta Ads | Upload van een export | Daarnaast een live koppeling na goedkeuring door Meta |
| Cockpit | Agents, taken en koppelingen zijn nagebootst met voorbeeldgegevens | Echte agents die via MCP werken in Figma, Canva, Meta en de rest |
| Markt | Negen voorbeeldtrends uit de kalender, vier zetten van Thijs | Dagelijkse scan van nieuws, KNMI, CBS en de kalender; Thijs plaatst zijn zetten via een beheerscherm |
| Klantdossier | Drie fictieve klanten in de code | Klanten als tabel, gekoppeld aan alles |

## Doelarchitectuur

- **Hosting en functions:** Netlify, zoals nu.
- **Frontend:** Next.js met TypeScript. Thijs werkt browser-first; Next.js draait zonder aanpassingen op Netlify.
- **Data en login:** Supabase in de EU-regio.
- **AI:** Anthropic via de Netlify AI Gateway, alleen vanuit server-functions. Nooit een key in de client.
- **Betalen:** Mollie of Stripe, beide met iDEAL. Keuze nog open.
- **Stijl:** zoals het prototype (Sana-richting): gebroken wit, witte kaarten, zachte lichtverlopen, Inter en Inter Tight, altijd licht.

## Datamodel

| Tabel | Belangrijkste velden | Wie ziet het |
| --- | --- | --- |
| profiles | naam, rol, agency, slug, publiek, zichtbaarheid per onderdeel | Eigenaar; publiek deel alleen als aangezet |
| teams, memberships | teamnaam; rol lid, eigenaar of beoordelaar | Leden van het team |
| scans | datum, rol, uitkomst (JSON), percentage uitvindend | Alleen de gebruiker; eigenaar ziet alleen het percentage |
| invalshoek_versies | zin, datum, week | Alleen de gebruiker, tenzij publiek |
| experiments | klant, titel, signaal, waarom, hypothese, keuze, bouw, tool, spec, link, meting, uitkomst, geleerd, zichtbaarheid, status, remix_van, week | Volgens zichtbaarheid: privé, team, publiek |
| metingen | week (1, 6, 12), scores per dimensie, percentage uit de Rolscan | Gebruiker en beoordelaar |
| portfolio | drie experiment-id's | Gebruiker en beoordelaar |
| eindopdrachten | pitch-link, reflectie, ingediend op | Gebruiker en beoordelaar |
| beoordelingen | beoordelaar, scores per criterium, cijfer, tweede beoordelaar | Beoordelaars en de gebruiker na vaststelling |
| klanten | naam, sector, merk, doelgroep, kanalen, team | Leden van het team |
| koppelingen | klant, tool, status, versleutelde toegang | Team-eigenaar en leden met rechten |
| taken (cockpit) | klant, agent, tool, titel, aanleiding, opties, uren, status, besluit, historie | Leden van het team |
| trends | titel, bron, momentum, sectoren, uitleg, wat je kunt doen, datum | Iedereen met een account |
| zetten | type (gestart, doorgebouwd, gestopt), titel, wat, waarom, uitkomst, link, trend | Iedereen met een account; alleen Thijs schrijft |
| watchlist | gebruiker, sectoren | Alleen de gebruiker |
| subscriptions | type, start, einde | Gebruiker en beheer |
| waitlist | e-mailadres, datum | Alleen beheer |

**Privacyregel voor row level security:** de eigenaar van een team ziet nooit rolscan-antwoorden, invalshoek-versies of privékaarten. Alleen percentages en wat met het team is gedeeld.

## Het toolcontract

Elke tool en tutorial in de library implementeert dezelfde vorm. In het prototype staat dit in het `TOOLS`-register.

1. **Meta:** id, type (tool of tutorial), stappen, leeruitkomsten, werking, en per eis uit het kader hoe de tool eraan voldoet.
2. **Invoer:** een briefing of data van de gebruiker.
3. **Analyse:** opties of patronen, met bewijs. Nooit één kant-en-klaar eindresultaat.
4. **Oordeel:** de gebruiker kiest en verantwoordt. Zonder verantwoording geen volgende stap.
5. **Uitvoer:** `createExperiment()` met signaal, bouw of hypothese, keuze en tool. De ronde gaat verder in stap 4 of 5.

**Acceptatietest per tool:** een ronde aanmaken zonder keuze-veld moet mislukken.

## Wat de AI-functies doen

| Endpoint | Modus | Doet | Doet nooit |
| --- | --- | --- | --- |
| `/api/scan` | | Deelt een werkweek in, geeft verhouding en één experiment | Oordelen over de persoon |
| `/api/coach` | stap 2 tot en met 5 | Controleert de punten uit de les, eindigt met één vraag | Het werk voor de gebruiker schrijven, beoordelen |
| `/api/coach` | spec | Zet antwoorden om in een bouwspec | |
| `/api/coach` | meta | Twee verklaringen per opvallend punt | Budgetadvies |
| `/api/coach` | concept | Dertig routes als JSON | Een eindconcept kiezen |

## Schermen in het prototype

Voorkant, Rolscan, Vandaag, Cockpit, Klantdossier, Markt, Reis (twaalf weken), Invalshoek, Ronde (stap 3 tot en met 5), Bouwen, Library met drie tools, Portfolio, Beoordeling, Metingen, Profiel, openbaar profiel en Team. Elk scherm staat als functie in `public/index.html`; de routes staan in het object `ROUTES`.

## Vaste regel voor de cockpit

Geen agent publiceert, betaalt of verschuift budget. Elke uitvoering komt in "Klaar voor jou" en vraagt goedkeuren, bijsturen of stoppen, altijd met een reden. Een goedkeuring maakt een experimentkaart aan. Acceptatietest: een taak goedkeuren zonder reden moet mislukken.

## Bouwvolgorde

1. **Accounts en data.** Supabase, login, de tabellen hierboven, de huidige `localStorage`-structuur overzetten. Daarna werkt alles wat er nu is, maar dan echt.
2. **Lessen uit de content.** `content/*.md` als enige bron, het `LES`-object verdwijnt.
3. **Tools op het contract.** Meta Ads-analyse, de Chrome-tutorial en de concept-machine, met de acceptatietest.
4. **Toetsing met rollen.** Deelnemer, team-eigenaar, beoordelaar. Portfolio, eindopdracht, beoordeling met tweede beoordelaar.
5. **Klanten en cockpit.** Klanten als tabel, de cockpit met taken, goedkeuren, bijsturen en stoppen. Eerste echte koppeling: Figma via de MCP-server. Canva daarna; merksjablonen automatisch vullen vraagt een Canva Enterprise-abonnement.
6. **Markt.** Een dagelijkse taak die nieuws, KNMI, CBS en de kalender scant en aan sectoren koppelt, plus een beheerscherm voor de zetten van Thijs.
7. **Betalen.** Founding member, half jaar, jaar, team.
8. **Meta live.** Pas na goedkeuring door Meta en verificatie van het bedrijf.

## Nog open

- De vragen in de metingen zijn voorlopig. Ze worden vervangen door de gevalideerde vragenlijsten van Janssen (2000) en Tierney & Farmer (2002) zodra vertaling en rechten geregeld zijn.
- Rate limit per gebruiker op de AI-functies.
- Video's per stap.
- Keuze tussen Mollie en Stripe.
- Erkenningsroute: partner-hogeschool of NLQF-inschaling.
- Naam van het platform: werktitel Uitvinder.
- Neue Montreal laadt van thijsmensink.nl. Werkt dat niet op een ander domein, dan is één CORS-header op thijsmensink.nl nodig, of de fontbestanden in de nieuwe repo (let op de licentie).
- Redenen en uitkomsten bij de zetten van Thijs schrijft hij zelf.

## Startopdracht voor Claude Code

```
Lees CLAUDE.md, BOUWEN-IN-CODE.md, spec.md en de mappen docs en content. Haal eerst public/index.html op zoals beschreven in public/LEES-MIJ.md; dat prototype is de functionele referentie.
Begin met stap 1 van de bouwvolgorde: Next.js met TypeScript op Netlify, Supabase in de EU-regio, login met magic link, en de tabellen uit het datamodel met row level security volgens de privacyregel.
Zet daarna de schermen Vandaag, Reis en een ronde (stap 3 tot en met 5) over, met dezelfde werking als het prototype.
Houd je aan de drie regels bovenaan. Stop na stap 1 en laat zien wat er staat.
```
