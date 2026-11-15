// Cockpit. De agents en hun taken zijn voorbeeldgegevens uit het prototype:
// er werkt nog geen echte agent in Figma, Canva of Meta. Wat wel echt is: de
// werkwijze. Niets wordt goedgekeurd, bijgestuurd of gestopt zonder reden, en
// een goedkeuring wordt een experimentkaart.
export const AGENTS: [string, string][] = [["Concept", "#ff8a5c"], ["Design", "#a98bff"], ["Tekst", "#7fcfb0"], ["Campagnes", "#8ab8ff"], ["Rapportage", "#f59ac0"], ["Planning", "#f2c14e"]];
export const TOOLNAMEN = ["Figma", "Canva", "Meta Ads", "Google Ads", "GA4", "Meta Business Suite", "Simplicate"];
export const SECTOREN = ["Horeca", "Retail", "Zorg", "Mobiliteit", "Food", "Bouw en installatie", "B2B-diensten", "Consument algemeen"];

export const VOORBEELDKLANTEN = [
  { sleutel: "velo", naam: "Fietsmerk Velo", sector: "Mobiliteit", merk: "Fietsen en onderdelen voor forensen, met eigen dealers", doelgroep: "Forensen die het hele jaar willen fietsen", kanalen: ["Instagram", "Meta Ads", "Website", "Nieuwsbrief"], koppelingen: ["Figma", "Canva", "Meta Ads", "GA4"] },
  { sleutel: "terhorst", naam: "Bakkerij Ter Horst", sector: "Food", merk: "Ambachtelijke dorpsbakker met drie winkels", doelgroep: "Vaste klanten uit het dorp en de regio", kanalen: ["Facebook", "Instagram", "Winkel"], koppelingen: ["Canva", "Meta Business Suite"] },
  { sleutel: "leeuw", naam: "Restaurant De Gouden Leeuw", sector: "Horeca", merk: "Familierestaurant met zaal voor groepen", doelgroep: "Gezinnen en bedrijven voor borrels en diners", kanalen: ["Instagram", "Google-profiel", "Website"], koppelingen: ["Figma", "Meta Business Suite"] },
];
export const VOORBEELDNAMEN = VOORBEELDKLANTEN.map((k) => k.naam);

export const VOORBEELDTAKEN = [
  { klant: "velo", agent: "Design", tool: "Canva", titel: "Instagram-post Winterklaar-check, drie varianten", aanleiding: "De eerste nachtvorst staat in de weersverwachting.", opties: ["Helder en nuchter: \"Is jouw fiets winterklaar?\"", "Urgent: \"Vannacht vriest het.\"", "Warm en menselijk: \"Gewoon blijven fietsen.\""], uren: 3, status: "klaar", besluit: "" },
  { klant: "velo", agent: "Campagnes", tool: "Meta Ads", titel: "Budget verschuiven naar de carrousel?", aanleiding: "Carrousel verlichting kost € 2,28 per resultaat, 72% onder de mediaan, met 6% van het budget.", opties: ["20% van het budget naar de carrousel", "Eerst een kleine stap: 5% voor een week", "Niets veranderen"], uren: 1, status: "klaar", besluit: "" },
  { klant: "velo", agent: "Rapportage", tool: "Meta Ads, GA4", titel: "Weekrapport week 44", aanleiding: "Opvallend: Story nachtvorst kostte € 249 en leverde nul resultaten op.", opties: ["Rapport zoals de agent het maakte", "Rapport met mijn duiding en voorstel erbij"], uren: 2, status: "klaar", besluit: "" },
  { klant: "terhorst", agent: "Tekst", tool: "Docs", titel: "Uitleg broodprijs 2027, drie toonsoorten", aanleiding: "Brood wordt volgend jaar duurder door hogere graanprijzen.", opties: ["Feitelijk, met de opbouw van de prijs", "Persoonlijk, in de woorden van de bakker", "Licht, met een knipoog"], uren: 1.5, status: "klaar", besluit: "" },
  { klant: "leeuw", agent: "Planning", tool: "Meta Business Suite", titel: "Contentkalender december", aanleiding: "Kerstreserveringen en bedrijfsborrels.", opties: [], uren: 2, status: "bezig", besluit: "" },
  { klant: "leeuw", agent: "Design", tool: "Figma", titel: "Menukaart met allergenenfilter, alle formaten", aanleiding: "Gasten vragen vaker naar allergenen.", opties: [], uren: 2.5, status: "bezig", besluit: "" },
  { klant: "terhorst", agent: "Concept", tool: "Concept-machine", titel: "Dertig routes voor kerstbestellingen", aanleiding: "Vorig jaar liep de telefoon vast in december.", opties: [], uren: 2, status: "goedgekeurd", besluit: "Gekozen: online reserveren per ophaaldag. Waarom: haalt de druk van de telefoon." },
] as const;

export const STATUSNAAM: Record<string, string> = { klaar: "Klaar voor jou", bezig: "Agent bezig", goedgekeurd: "Goedgekeurd", gestopt: "Gestopt" };
export const uur = (n: number) => String(n).replace(".", ",");
