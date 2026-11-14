# Van uitvoerder naar uitvinder — specificatie

Lees dit bestand aan het begin van elke sessie. Het is de bron van de bedoeling. Wijkt iets in de code af van dit document, dan vraag je het eerst aan Thijs.

## Waar dit over gaat

AI neemt het uitvoerende werk in marketingteams en agencies over. Wie dat werk doet, zoals designers, copywriters en marketeers, moet een andere rol aannemen om relevant te blijven. Ze blijven gewoon in hun team, maar worden uitvinders. Dit platform begeleidt die reis, inclusief het leren bouwen van eigen tools.

## De kern: uitvoerder tegenover uitvinder

Een uitvoerder wacht op een brief, levert iets op, en dan is het project klaar.
Een uitvinder brengt de brief zelf mee, bouwt iets, meet het en blijft eraan werken. Hij gaat uit zichzelf op zoek naar relevantie voor het merk van de opdrachtgever.

Voorbeelden van een dinsdag als uitvinder:
- Designer: maakt geen losse uitingen meer, maar een tool die de doelgroep van de klant echt gebruikt, en ontwerpt het systeem waar alle uitingen uit voortkomen.
- Copywriter: volgt het nieuws, ziet waar het merk iets te zeggen heeft en heeft binnen een dag een reactie klaar.
- Marketeer: draait elke week één experiment met een hypothese en laat de klant zien wat werkte.

## Voor wie

- Gebruiker: het individu (designer, copywriter, marketeer, senior of junior) dat zijn rol verandert.
- Koper: het individu zelf, of de agency-eigenaar of creative director voor het hele team.
- Waarom een agency koopt: uitvoerend werk wordt per uur verkocht, en precies die uren worden goedkoper door AI. Een team van uitvinders verkoopt ideeën en oordeel. Het platform beschermt dus het verdienmodel van de agency.

## De reis

Eenmalig, het fundament:
1. Rolscan: hoeveel van je werk is uitvoerend en hoeveel uitvindend? Dit is de nulmeting. Later herhaal je hem om de verschuiving te zien.
2. Jouw invalshoek: wat combineer jij dat schaars is? Je vak plus iets van daarbuiten. Uitkomst: één zin.

Elke week, de cyclus:
3. Relevantie zoeken: waar heeft het merk van je klant deze week iets te zeggen? Denk aan nieuws, vragen van de doelgroep of een moment in de markt.
4. Uitvinden: één experiment met een hypothese, gebouwd met tools en daarna gemeten.
5. Zichtbaar maken: je deelt wat je maakte, eerst privé of met je team, later eventueel publiek.

Elke ronde van stap 3 tot en met 5 levert een experimentkaart op.

## De library

De library groeit door wat je maakt, niet door wat je leest. Een experimentkaart bevat:
- het signaal (waarom nu, voor welk merk)
- de hypothese
- wat er gebouwd is, met link
- de prompt of spec waarmee het gebouwd is
- de uitkomst en wat je ervan leerde
- zichtbaarheid: privé, team of publiek

Remixen: een teamlid kan een kaart als startpunt gebruiken. De nieuwe kaart verwijst naar het origineel. Zo wordt elke tool het begin van de volgende.

## Profiel

Het profiel is het bewijs dat iemand uitvinder is. Geen cv, maar wat je gemaakt hebt.
- Foto, naam, rol, agency (optioneel)
- Je invalshoek in één zin
- De verschuiving van je verhouding uitvoerend/uitvindend in de tijd, vanaf je nulmeting
- Je publieke experimentkaarten, als portfolio van wat je uitvond
- Eigen link: thijsmensink.nl/uitvinder/[naam]
- Standaard privé. Openbaar maken is een bewuste keuze, per onderdeel.

## Bouwen

Het platform leert mensen bouwen, maar is zelf geen bouwomgeving. Er wordt gebouwd in bestaande tools, zoals Claude, Lovable en Netlify.

Leer vooral het patroon, want tools veranderen elke maand:
1. de vraag scherp krijgen
2. een spec schrijven
3. bouwen
4. testen
5. live zetten

Bouwmodule als instap: "je eerste tool in een middag".

## AI-coach

- Denkt mee, schrijft niet voor iemand. Stelt vragen, scherpt hypotheses en specs aan, wijst op zwakke plekken.
- Geen complimenten als opening, geen motivatiequotes, geen goeroetoon.
- Draait via de Anthropic API (Claude Sonnet, actuele versie) in een serverless function. De key staat in een env var en komt nooit in de client.
- Gebruik per gebruiker begrenzen (redelijk gebruik), ook voor lifetime-leden.

## Verdienmodel

- Founding member: €799 lifetime, maximaal 100 plekken, alleen bij de lancering.
- Half jaar: €279.
- Jaar: €449.
- Team: €450 per plek per jaar excl. btw, vanaf 5 plekken, inclusief dashboard en gedeelde library.
- Betalen met iDEAL is verplicht. Stripe of Mollie, keuze in fase 2.
- Prijzen staan in één configbestand, zodat ze zonder codewijziging aan te passen zijn.

## Naam en plek

- Onder de naam Thijs Mensink, met als titel "Van uitvoerder naar uitvinder" (zonder komma).
- Plek: thijsmensink.nl/uitvinder. De hoofdsite is een aparte Netlify-site (vanilla HTML). Bouw dit platform als een eigen Netlify-site en koppel het via een proxy-rewrite in de netlify.toml van de hoofdsite. Lukt dat niet goed, stel dan uitvinder.thijsmensink.nl voor.

## Harde regels

- Alle tekst in het Nederlands. Direct, kort, geen marketingtoon, geen goeroetoon.
- AI versnelt, de mens beslist.
- Schrijf zelf geen lesstof. Alle inhoud komt uit de map /content en wordt door Thijs geschreven. Ontbreekt inhoud, gebruik dan een duidelijk gemarkeerde placeholder ("[INHOUD VOLGT]"), nooit zelfverzonnen tekst.
- Privacy:
  - Persoonlijke reflecties (rolscan-antwoorden, invalshoek, privé-kaarten) zijn alleen zichtbaar voor de gebruiker zelf. Ook niet voor de team-eigenaar.
  - De team-eigenaar ziet alleen de verhouding uitvoerend/uitvindend per persoon en kaarten die met het team zijn gedeeld.
  - Delen gebeurt alleen na een bewuste keuze van de gebruiker.
  - Data in de EU. Geen tracking-cookies.
- Thijs werkt browser-first, zonder lokale dev-omgeving. Alles moet via Netlify te deployen zijn.

## Stijl

Gelijk aan thijsmensink.nl:
- rood op wit, zichtbaar grid
- Neue Montreal (fallback: system sans-serif), een mono-font voor kleine labels
- labels met een punt ervoor, zoals ".jouw rol"
- geen serif, geen italics
- altijd light mode, ook als het systeem op dark mode staat

## Techniek

- Fase 1: één HTML-pagina plus één Netlify-function.
- Fase 2 en 3: stel zelf een stack voor en leg die voor aan Thijs voordat je bouwt. Uitgangspunt: Netlify voor hosting en functions, Supabase (EU-regio) voor login en database.

## Datamodel (vanaf fase 2)

- User, Profiel (zichtbaarheid per onderdeel)
- Team, Membership (rol: lid of eigenaar)
- Rolscan (per meting: datum, verhouding, antwoorden; antwoorden zijn privé)
- Invalshoek (één zin, versies)
- Experiment (signaal, hypothese, gebouwd, link, spec/prompt, uitkomst, geleerd, zichtbaarheid, remix_van)
- Abonnement (type, start, einde)

## Fasen

### Fase 1: Rolscan (gratis tool)
- De gebruiker beschrijft in eigen woorden een gewone werkweek.
- De AI splitst dat in uitvoerend en uitvindend werk, met een percentage per kant en één concreet experiment voor volgende week.
- Het resultaat is te exporteren als deelbaar beeld (1080x1350) voor LinkedIn.
- Geen accounts, geen database. Werkweek en uitkomst worden nergens opgeslagen.
- Wachtlijst: alleen een e-mailadres via Netlify Forms.
- Klaar als: live op Netlify en getest met drie rollen (designer, senior marketeer, copywriter).
- Daarna stoppen en wachten op akkoord.

### Fase 2: Individu
- Accounts, profiel, fundament (stap 1 en 2), wekelijkse cyclus (stap 3 tot en met 5), persoonlijke library, bouwmodule, AI-coach, betalen.
- De Rolscan uit fase 1 wordt stap 1 binnen het platform; de uitkomst wordt de opgeslagen nulmeting.
- Eerst getest met het team van Sterrenstof.
- Klaar als: één teamlid heeft het fundament en drie cycli doorlopen.
- Daarna stoppen en wachten op akkoord.

### Fase 3: Team
- Teamaccounts, dashboard voor de eigenaar, gedeelde library, remixen, teambetaling.
- Klaar als: één agency gebruikt het met minimaal 5 plekken.

## Open punten

- Alle inhoud van de modules (komt in /content).
- Stripe of Mollie.
- Definitieve koppeling met thijsmensink.nl/uitvinder.

## Aanvullingen (1 november 2026)

- Onderwijskundig kader: leeruitkomsten, constructive alignment, toetsing, rubric en meting staan in docs/onderwijskundig-kader.md. Elke nieuwe les, tool of functie gaat door de doeltoets uit dat kader.
- Twaalf weken: week 1 fundament, week 2 tot en met 11 tien rondes, week 12 eindopdracht. Metingen in week 1, 6 en 12 (vragenlijsten plus Rolscan).
- Portfolio: minimaal 8 afgeronde rondes, de deelnemer kiest de drie sterkste kaarten. Eindopdracht: pitch plus reflectie van 1.000 tot 1.500 woorden. Beoordeling door een mens met de rubric; de AI beoordeelt nooit.
- Experimentkaart heeft een veld "Waarom deze keuze?".
- Library bevat tools (in het platform gebouwd) en tutorials (werkwijze met bestaande AI, zoals Claude in Chrome). Beide voldoen aan de zes eisen uit het kader: de tool doet het uitvoerende werk, de mens het oordeel.
- Meta Ads-analyse v1 werkt met een export uit Ads Manager. Een live koppeling vraagt een Meta-app met goedgekeurde toegang en een geverifieerd bedrijf.
- De vragen in de metingen zijn voorlopig en in eigen woorden. Ze worden vervangen door de gevalideerde vragenlijsten zodra vertaling en gebruiksrechten geregeld zijn.
- Toolregister (`TOOLS` in de code): elke tool en tutorial meldt type, stappen, leeruitkomsten, werking en per eis uit het kader hoe hij eraan voldoet. Dat staat op elke toolpagina in het blok "Zo werkt deze tool".
- Concept-machine: briefing plus invalshoek, dertig routes als ruw materiaal, maximaal drie op een shortlist, daarna een eigen concept met verantwoording en eigen toevoeging. Zonder die twee geen ronde.
- Overdracht naar Claude Code: zie BOUWEN-IN-CODE.md.
- Cockpit (regiedashboard): per klant wat de agents klaarzetten, met goedkeuren, bijsturen of stoppen, altijd met een reden. Een goedkeuring wordt een experimentkaart. Geen agent publiceert, betaalt of verschuift budget zelf.
- Klantdossier: per klant het merk, lopend werk, experimenten, trends voor de sector en koppelingen.
- Markt: trends per sector met de drievragentoets als eerste inschatting, plus de zetten van Thijs (wat hij bouwt en waarom). Elke trend kan direct een signaal worden.
- Bouwmodule op niveau: les met video, proeftuin "Wat mist er in deze spec?", en per stap waaraan je ziet dat het goed is.
- Stijl: Sana-richting, Neue Montreal, altijd licht.
