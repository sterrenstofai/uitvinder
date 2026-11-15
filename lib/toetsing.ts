// Metingen en beoordeling. De omschrijvingen per niveau staan in content/studiewijzer.md.
import type { BeoordelingScores, Meting } from "./types";

// Voorlopige vragen in eigen woorden, overgenomen uit het prototype. Ze worden
// vervangen door de gevalideerde vragenlijsten (Janssen, 2000; Tierney & Farmer, 2002).
export const MEET = {
  gen: { n: "Ideeën bedenken", q: ["Ik bedenk nieuwe ideeën voor merken waar ik aan werk, zonder dat iemand erom vraagt.", "Ik zoek actief naar nieuwe manieren om een probleem van een klant aan te pakken.", "Ik kom met oplossingen die nog niet eerder zijn geprobeerd."] },
  prom: { n: "Ideeën inbrengen", q: ["Ik zorg dat collega’s of klanten enthousiast raken over een nieuw idee.", "Ik zoek steun bij anderen om een idee uit te voeren.", "Ik breng mijn ideeën in bij overleg met klant of team."] },
  real: { n: "Ideeën uitvoeren", q: ["Ik maak van een idee iets wat mensen echt kunnen gebruiken.", "Ik test nieuwe ideeën in de praktijk voordat ik ze groter maak.", "Ik maak zelf iets werkends met AI, zonder op een ontwikkelaar te wachten."] },
  cse: { n: "Creatief zelfvertrouwen", q: ["Ik vertrouw erop dat ik creatieve oplossingen kan bedenken.", "Ik kan een vaag probleem omzetten in een idee dat te testen is.", "Ik durf iets uit te proberen waarvan ik de uitkomst niet weet."] },
} as const;
export type MeetDim = keyof typeof MEET;
export const MEETWEKEN = [1, 6, 12];

export const RUBRIC = ["Signaal", "Hypothese en meting", "Bouw en oordeel over AI", "Uitkomst en inzicht", "Delen"];
export const EINDRUBRIC = ["Pitch", "Reflectie op de verschuiving", "Eigen ontwikkeling"];
export const NIVEAUS = ["Onvoldoende", "Voldoende", "Goed", "Excellent"];
export const PUNTEN = [4, 6, 8, 10];
export const SLAAGGRENS = 5.5;

const gem = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
export const getal1 = (n: number) => n.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Portfolio 60%, eindopdracht 40%. Geslaagd bij 5,5 of hoger en geen onderdeel onder de 5. */
export function cijfers(s: BeoordelingScores, kaartIds: string[]) {
  const p = kaartIds.flatMap((id) => s.kaarten[id] ?? []);
  const compleet =
    kaartIds.length > 0 &&
    kaartIds.every((id) => (s.kaarten[id] ?? []).filter((x) => x !== undefined && x !== null).length === RUBRIC.length) &&
    s.eind.filter((x) => x !== undefined && x !== null).length === EINDRUBRIC.length;
  if (!compleet) return { compleet, portfolio: NaN, eindopdracht: NaN, eind: NaN, geslaagd: false };
  const portfolio = gem(p.map((k) => PUNTEN[k]));
  const eindopdracht = gem(s.eind.map((k) => PUNTEN[k]));
  const eind = 0.6 * portfolio + 0.4 * eindopdracht;
  return { compleet, portfolio, eindopdracht, eind, geslaagd: Math.round(eind * 10) / 10 >= SLAAGGRENS && portfolio >= 5 && eindopdracht >= 5 };
}

export const werkgedrag = (m: Meting) => (m.scores.gen + m.scores.prom + m.scores.real) / 3;
