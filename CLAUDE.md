# CLAUDE.md — Van uitvoerder naar uitvinder

Lees dit aan het begin van elke sessie. Daarna: `BOUWEN-IN-CODE.md`, `spec.md`, `docs/` en `content/`.

## Wat dit is

Een platform dat designers, copywriters, marketeers en strategen in agencies van uitvoerder naar uitvinder brengt. Werktitel: Uitvinder, door Thijs Mensink. Het prototype in `public/prototype/index.html` (op te halen volgens `public/LEES-MIJ.md`, live te bekijken op `/prototype/index.html`) is de functionele referentie: elk scherm, elke tool en elke regel die daar werkt, moet in de echte versie hetzelfde werken.

## Drie regels bij elke wijziging

1. **De leeruitkomsten blijven staan.** Elke les, tool of functie gaat door de doeltoets in `docs/onderwijskundig-kader.md`. Is één antwoord nee, dan aanpassen of laten vallen.
2. **Het gaat om de tools.** De library en de cockpit zijn de reden om te betalen. De reis is de reden om te blijven en te veranderen.
3. **De tool doet het uitvoerende werk, de mens het oordeel.** Geen tool maakt een ronde aan zonder keuze en reden. Geen agent publiceert, betaalt of verschuift budget zonder goedkeuring met reden.

## Werkwijze met Thijs

- Thijs werkt browser-first, zonder lokale ontwikkelomgeving. Alles moet via GitHub en Netlify te deployen zijn.
- Communicatie in het Nederlands, direct en kort. Geen goeroetoon. Eerlijke tegenspraak waar nodig.
- Thijs is visueel: laat bij elke fase zien hoe het eruitziet (live link of screenshot), niet alleen wat er technisch staat.
- Werk in fasen volgens de bouwvolgorde in `BOUWEN-IN-CODE.md`. Stop na elke fase en laat zien wat er staat.
- Schrijf geen lesstof zelf. Lesstof komt uit `content/`. Ontbreekt iets, zet een duidelijk gemarkeerde placeholder.

## Stijl

- Sana Labs-richting: gebroken wit (#f7f5f2), witte kaarten met ronde hoeken, zachte lichtverlopen in perzik, koraal, lila en blauw.
- Lettertype Neue Montreal (geladen van thijsmensink.nl/fonts), fallback Inter.
- Altijd licht, ook als het systeem op donker staat.
- Kleur per stap: 1 oranje, 2 paars, 3 groen, 4 blauw, 5 roze.

## Privacy

De team-eigenaar ziet nooit rolscan-antwoorden, invalshoek-versies of privékaarten van teamleden. Alleen percentages en wat met het team is gedeeld. Data in de EU.

## Stand van de bouw

Zie `README.md` voor wat er staat, hoe je het koppelt en wat nog niet is overgezet. Het datamodel staat in `supabase/migrations/`, de privacytests in `supabase/tests/`. Draai die tests na elke wijziging aan tabellen of policies.
