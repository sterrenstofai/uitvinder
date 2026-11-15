// Markt. Zolang er geen trends in de database staan, toont het platform de
// voorbeeldtrends en de zetten uit het prototype (kalender van november 2026).
// Thijs zet echte trends en zetten erin via het beheerblok op de pagina.
import { SECTOREN } from "./cockpit";
import type { Data, Trend, Zet } from "./types";

export const VOORBEELDTRENDS: Trend[] = [
  { id: "t1", titel: "Zorgpremies 2027 bekend, overstappen kan tot en met 31 december", bron: "Kalender en nieuws", momentum: "Piek nu", sectoren: ["Zorg", "Consument algemeen", "B2B-diensten"], uitleg: "Elk jaar dezelfde vraag in november en december: wordt het duurder, en moet ik overstappen?", wat_je_kunt_doen: "Een rekentool of check die de vraag voor je doelgroep beantwoordt." },
  { id: "t2", titel: "Wat verandert er per 1 januari 2027?", bron: "Kalender", momentum: "Stijgend", sectoren: SECTOREN, uitleg: "Nieuwe regels, tarieven en toeslagen. Mensen en ondernemers zoeken wat het voor hen betekent.", wat_je_kunt_doen: "Een overzicht voor je sector: wat verandert er voor jouw klanten?" },
  { id: "t3", titel: "Wintertijd: om half zes is het donker", bron: "Kalender", momentum: "Blijvend tot maart", sectoren: ["Mobiliteit", "Retail", "Horeca", "Consument algemeen"], uitleg: "Donkere ochtenden en avonden. Zichtbaarheid in het verkeer, meer thuisblijven, ander koopgedrag.", wat_je_kunt_doen: "Een check op verlichting, of een tip voor de avond thuis." },
  { id: "t4", titel: "Black Friday op 27 november", bron: "Kalender", momentum: "Stijgend", sectoren: ["Retail", "Food", "Consument algemeen"], uitleg: "Kortingen overal. Wie niet meedoet, kan juist opvallen door iets anders te bieden.", wat_je_kunt_doen: "Een eerlijke vergelijking of een alternatief zonder korting." },
  { id: "t5", titel: "December: Sinterklaas, kerst en de bestelpiek", bron: "Kalender", momentum: "Stijgend", sectoren: ["Retail", "Food", "Horeca"], uitleg: "Cadeaus, bestellingen en reserveringen pieken. Klanten bellen, mailen en wachten.", wat_je_kunt_doen: "Online reserveren of bestellen zonder telefoon." },
  { id: "t6", titel: "Eerste nachtvorst in de weersverwachting", bron: "Weer (KNMI)", momentum: "Nieuw", sectoren: ["Mobiliteit", "Bouw en installatie", "Horeca"], uitleg: "Gladde wegen, bevroren ruiten, cv-ketels die het zwaar krijgen.", wat_je_kunt_doen: "Een winterklaar-check voor fiets, auto of huis." },
  { id: "t7", titel: "Eindejaarsbudgetten bij bedrijven", bron: "Kalender", momentum: "Stijgend", sectoren: ["B2B-diensten", "Bouw en installatie"], uitleg: "Budgetten die voor 31 december op moeten. Beslissers zoeken snel iets nuttigs.", wat_je_kunt_doen: "Een korte check die laat zien waar het budget het meest oplevert." },
  { id: "t8", titel: "Kerstreserveringen en bedrijfsborrels", bron: "Kalender", momentum: "Stijgend", sectoren: ["Horeca", "Food"], uitleg: "Groepen, dieetwensen, aanbetalingen. Veel heen-en-weer per reservering.", wat_je_kunt_doen: "Een groepsreservering waarin alles in één keer geregeld wordt." },
  { id: "t9", titel: "Boodschappen blijven duur", bron: "Nieuws en CBS", momentum: "Blijvend", sectoren: ["Food", "Retail", "Consument algemeen"], uitleg: "Een onderwerp dat al lang speelt. Is het van nu, of eigenlijk altijd waar?", wat_je_kunt_doen: "Een vergelijking die mensen zelf niet kunnen maken." },
];
export const VOORBEELDZETTEN: Zet[] = [
  { id: "m1", type: "gestart", titel: "Zorgkosten 2027", wat: "Een tool die laat zien wat je zorg in 2027 kost, zodat je kunt kiezen of je overstapt.", waarom: "De premies voor 2027 zijn bekend en iedereen heeft dezelfde vraag: wat betekent dit voor mij?", uitkomst: "", link: "https://zorgkosten-2027.netlify.app", trend_id: "t1" },
  { id: "m2", type: "gestart", titel: "Wat kost 2027", wat: "Eén overzicht van alle huishoudkosten die in 2027 veranderen door besluiten van de overheid.", waarom: "Per 1 januari verandert van alles tegelijk. Niemand ziet wat het bij elkaar opgeteld betekent.", uitkomst: "", link: "", trend_id: "t2" },
  { id: "m3", type: "doorgebouwd", titel: "vanavond.", wat: "Nieuwe series en films op Nederlandse streamingdiensten, gefilterd op je abonnementen en je stemming.", waarom: "Het is weer vroeg donker. Mensen blijven thuis en zoeken wat ze vanavond kijken.", uitkomst: "", link: "https://vanavond-app.netlify.app", trend_id: "t3" },
  { id: "m4", type: "gestart", titel: "Weet wat je eet", wat: "Supermarktproducten naast zelfgemaakt: wat zit erin, en wat kost het.", waarom: "Boodschappen blijven duur en mensen willen weten waar ze voor betalen.", uitkomst: "", link: "https://weet-wat-je-eet.netlify.app", trend_id: "t9" },
];
export const ZETNAAM: Record<string, string> = { gestart: "Gestart", doorgebouwd: "Doorgebouwd", gestopt: "Gestopt" };

/** De trends en zetten die het platform toont, en of dat de voorbeelden zijn. */
export function markt(d: Data) {
  const voorbeeld = d.trends.length === 0;
  return { voorbeeld, trends: voorbeeld ? VOORBEELDTRENDS : d.trends, zetten: voorbeeld && d.zetten.length === 0 ? VOORBEELDZETTEN : d.zetten };
}
export const voorMij = (trends: Trend[], watch: string[]) => trends.filter((t) => !watch.length || t.sectoren.some((x) => watch.includes(x)));
