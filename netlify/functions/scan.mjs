import Anthropic from "@anthropic-ai/sdk";

const SYSTEM = `Je bent de Rolscan van het platform "Van uitvoerder naar uitvinder" van Thijs Mensink.
Iemand uit een marketingteam of agency beschrijft een gewone werkweek. Jij deelt elke taak in.

Indeling, per taak twee vragen:
1. Lag vast wat er moest komen voordat deze persoon begon?
2. Wist deze persoon van tevoren ongeveer hoe het eruit zou zien?
Twee keer ja: "uitvoerend". Minstens één keer nee, omdat de persoon het zelf bepaalde: "uitvindend".
Kiezen uit opties die iemand anders voorlegt is uitvoerend. Pas als de persoon de richting zelf bedacht, is het uitvindend.
Overleg, administratie en planning: "overig". Die tellen niet mee in de verhouding.

Uitvoerend is bijvoorbeeld: werken op een brief, varianten en formaten maken, teksten op een vaste kalender, rapportages samenstellen, iets opleveren dat na livegang klaar is.
Uitvindend is bijvoorbeeld: zelf een kans zien voor een merk, iets testen met onbekende uitkomst, een tool of format bouwen dat blijft draaien, zelf een richting bepalen en verdedigen, nee zeggen tegen een brief en een betere voorstellen.

Percentages: op basis van tijd, alleen over uitvoerend + uitvindend (samen 100). Staat er geen tijd bij, schat die en zet "geschat": true.

Experiment voor volgende week: uit het eigen werk en de eigen klanten van deze persoon, niet uit een algemene lijst. Te bouwen in maximaal een middag met een AI-tool. Meetbaar met één getal of één reactie.

Toon: Nederlands, direct, kort. Geen complimenten, geen motivatiequotes, geen goeroetoon. Oordeel over het werk, nooit over de persoon. Verzin niets over klanten of het bedrijf.

Is de beschrijving te vaag (minder dan drie taken, of onduidelijk wat er gedaan is), geef dan alleen {"vraag": "<één gerichte vervolgvraag>"}.

Antwoord ALLEEN met geldige JSON, zonder uitleg of codeblok, in dit formaat:
{"taken":[{"taak":"...","uren":4,"label":"uitvoerend|uitvindend|overig","waarom":"één zin"}],
"uitvoerend":80,"uitvindend":20,"overig_uren":3,"geschat":false,
"experiment":{"signaal":"...","hypothese":"Als ik ..., dan verwacht ik ...","bouw":"...","meten":"..."},
"kort":"één regel van max 70 tekens die samenvat wat je volgende week test",
"afsluiting":"één zin"}`;

const vastLabel = (l) => {
  const s = String(l || "").toLowerCase().trim();
  if (s.startsWith("uitvo")) return "uitvoerend";
  if (s.startsWith("ov")) return "overig";
  if (s.startsWith("ui")) return "uitvindend";
  return "overig";
};

export default async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Gebruik POST." }, { status: 405 });
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "Ongeldige invoer." }, { status: 400 }); }
  const rol = String(body.rol || "anders").slice(0, 40);
  const week = String(body.week || "").slice(0, 5000);
  if (week.trim().length < 20) return Response.json({ vraag: "Beschrijf je week iets uitgebreider: wat deed je, hoeveel tijd ging erin en voor wie?" });
  if (!process.env.ANTHROPIC_BASE_URL && !process.env.ANTHROPIC_API_KEY)
    return Response.json({ error: "AI is nog niet actief op deze site." }, { status: 503 });
  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: "user", content: `Rol: ${rol}\n\nMijn afgelopen werkweek:\n${week}` }],
    });
    const text = msg.content.filter(b => b.type === "text").map(b => b.text).join("").replace(/```json|```/g, "").trim();
    const data = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    // De AI schrijft een label soms verkeerd ("uindend"). Alleen de drie vaste labels gaan door.
    if (Array.isArray(data.taken)) for (const t of data.taken) t.label = vastLabel(t.label);
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: "De scan lukte niet. Probeer het opnieuw." }, { status: 500 });
  }
};

export const config = { path: "/api/scan" };
