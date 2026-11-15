// Toolregister. Elke tool en tutorial meldt stap, leeruitkomst, werking en hoe hij
// aan de zes eisen uit het onderwijskundig kader voldoet. Overgenomen uit het prototype.
export const EISEN = [
  "Hangt aan een stap en een leeruitkomst",
  "Levert opties of patronen, geen kant-en-klaar eindresultaat",
  "Vraagt jouw keuze en een verantwoording, die op de kaart komt",
  "Is open: je ziet hoe hij werkt",
  "Uitkomst gaat naar stap 4 als hypothese of naar stap 5 als uitkomst",
  "Gebruikt geen klantgegevens buiten wat met de klant is afgesproken",
];
export type Tool = { id: string; type: "Tool" | "Tutorial"; titel: string; stap: number[]; lu: string[]; kort: string; seed: string; werking: string[]; eisen: string[] };
export const TOOLS: Tool[] = [
  { id: "meta", type: "Tool", titel: "Meta Ads-analyse", stap: [3, 4], lu: ["LU2", "LU3"], kort: "Upload een export en zie waar je advertenties lekken en waar kansen liggen.", seed: "tool-meta-1",
    werking: ["Leest een export uit Ads Manager in je browser; de data gaat niet naar een server.", "Rekent per advertentie budgetaandeel, CTR, kosten per resultaat en frequentie uit.", "Zoekt vijf patronen: dure advertenties met veel budget, goedkope winnaars met weinig budget, slijtage, uitgaven zonder resultaat en hoge frequentie.", "Advertenties onder 1.000 weergaven tellen niet mee.", "De AI krijgt alleen de samenvatting en geeft verklaringen, nooit budgetadvies."],
    eisen: ["Stap 3 en 4, LU2 en LU3", "Laat patronen met bewijs zien, beslist niets", "Je kiest één punt en schrijft op waarom", "Werking staat in dit blok", "Wordt een ronde met signaal, keuze en hypothese", "Export blijft in je browser"] },
  { id: "chrome", type: "Tutorial", titel: "Meta Ads lezen met Claude in Chrome", stap: [3, 4], lu: ["LU2", "LU3"], kort: "Actuele cijfers, direct in je browser. Met een prompt die alleen leest.", seed: "tool-chrome-5",
    werking: ["Claude in Chrome leest Ads Manager in jouw ingelogde sessie.", "De prompt verbiedt wijzigen en publiceren, en vraagt om bewijs en twee verklaringen per punt."],
    eisen: ["Stap 3 en 4, LU2 en LU3", "Claude noemt wat opvalt, met bewijs en verklaringen", "Je plakt het punt dat je kiest en schrijft op waarom", "De volledige prompt staat in de tutorial, de werking in dit blok", "Wordt een ronde met signaal, keuze en hypothese", "Alleen met akkoord van de klant"] },
  { id: "concept", type: "Tool", titel: "Concept-machine", stap: [4], lu: ["LU3"], kort: "Dertig conceptroutes als ruw materiaal. Jij kiest, combineert en verdedigt er één.", seed: "tool-concept-2",
    werking: ["Je geeft een korte briefing: merk, doelgroep, de vraag en je randvoorwaarden. Je invalshoek gaat automatisch mee.", "De AI maakt dertig routes, verdeeld over tool, format, campagne, actie, product en samenwerking. Minstens vijf vertrekken vanuit je invalshoek.", "Jij zet er maximaal drie op een shortlist en maakt er één concept van.", "Zonder verantwoording en zonder eigen toevoeging wordt het geen ronde."],
    eisen: ["Stap 4, LU3", "Dertig routes als ruw materiaal, geen eindconcept", "Je kiest, combineert en schrijft op waarom en wat je zelf toevoegde", "Werking staat in dit blok", "Wordt een ronde met jouw concept als wat je bouwt", "Alleen wat je zelf in de briefing zet"] },
];

export const CHROME_PROMPT = `Je kijkt mee in Meta Ads Manager. Alleen lezen: wijzig niets, klik niet op knoppen die iets aanpassen en publiceer niets.

1. Lees voor de zichtbare periode per advertentie: besteed bedrag, weergaven, CTR, kosten per resultaat en frequentie.
2. Noem maximaal vier dingen die opvallen, elk met de cijfers als bewijs. Laat advertenties met minder dan 1.000 weergaven buiten de vergelijking.
3. Geef bij elk punt twee verklaringen die elkaar uitsluiten, en wat ik zou moeten zien om ertussen te kiezen.
4. Geef geen advies om budget te verschuiven of advertenties aan of uit te zetten. Die keuze maak ik.
5. Sluit af per punt met: Opvallend, Bewijs, Vraag.`;

export type Route = { titel: string; idee: string; type: string; invalshoek: boolean };
export const VOORBEELDROUTES: Route[] = ([
  ["Winterklaar-check", "Forensen kiezen hun fietstype en krijgen een checklist voor banden, licht en kleding.", "tool", false],
  ["Nachtvorstalarm", "De avond voor de eerste nachtvorst een bericht met wat je morgen anders moet doen.", "format", false],
  ["Gratis lichtcheck", "In de eerste donkere week controleert de dealer gratis je verlichting.", "actie", false],
  ["De doorfietsers", "Portretten van forensen die de hele winter blijven fietsen, in hun eigen woorden.", "campagne", false],
  ["Koffie voor wie fietst", "Met een koffiezaak: warme koffie voor wie in de eerste vorstweek op de fiets komt.", "samenwerking", false],
  ["Bandenspanning van de week", "Elke maandag één getal: de juiste bandenspanning bij het weer van die week.", "format", false],
  ["Winterpakket als abonnement", "Banden en verlichting voor de winter, in het voorjaar terug in te ruilen.", "product", false],
  ["Hoe zichtbaar ben jij?", "Een korte quiz die laat zien hoe zichtbaar je bent in het donker, met tips.", "tool", false],
  ["Wachten zoals de gastvrouw", "De dealer ontvangt winterfietsers zoals een restaurant gasten: drinken, en klaar terwijl je wacht.", "actie", true],
  ["Het eerste kopje bij de deur", "Een warm welkom in de werkplaats, gebaseerd op hoe horeca de eerste indruk regelt.", "samenwerking", true],
  ["Menukaart voor je fiets", "Onderhoud als menukaart: drie gangen, vaste prijs, geen verrassingen.", "product", true],
  ["Winterdagenteller", "Forensen tellen hun winterdagen op de fiets en zien die van hun collega’s.", "tool", false],
] as [string, string, string, boolean][]).map(([titel, idee, type, invalshoek]) => ({ titel, idee, type, invalshoek }));
