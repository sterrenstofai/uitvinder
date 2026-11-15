// Rekenwerk van de Meta Ads-analyse, overgenomen uit het prototype. Alles draait
// in de browser; de export gaat niet naar een server.
/* eslint-disable @typescript-eslint/no-explicit-any */
export const MCOL: Record<string, string[]> = {
  ad: ["advertentienaam", "ad name", "naam advertentie", "advertentie"],
  campaign: ["campagnenaam", "campaign name", "campagne"],
  day: ["dag", "day", "begin rapportage", "reporting starts", "datum", "date"],
  spend: ["besteed bedrag", "amount spent", "uitgegeven bedrag", "spend"],
  impr: ["weergaven", "impressions", "vertoningen"],
  reach: ["bereik", "reach"],
  freq: ["frequentie", "frequency"],
  clicks: ["linkklikken", "link clicks", "klikken (alle)", "clicks (all)", "klikken", "clicks"],
  results: ["resultaten", "results", "aankopen", "purchases", "leads"],
  value: ["conversiewaarde", "conversion value", "purchase value", "aankoopwaarde"],
};
export const MLAB: Record<string, string> = { ad: "Advertentie", campaign: "Campagne", day: "Dag", spend: "Besteed bedrag", impr: "Weergaven", reach: "Bereik", freq: "Frequentie", clicks: "Klikken", results: "Resultaten", value: "Conversiewaarde" };
export type Rij = Record<string, any>;
export type Kaart = Record<string, string | undefined>;

export function autoMap(head: string[]): Kaart {
  const m: Kaart = {}, low = head.map((h) => String(h).toLowerCase().trim());
  for (const [k, syn] of Object.entries(MCOL)) {
    for (const sy of syn) {
      const i = low.findIndex((h) => h === sy || h.startsWith(sy));
      if (i >= 0 && !Object.values(m).includes(head[i])) { m[k] = head[i]; break; }
    }
  }
  return m;
}
export function pNum(v: any): number {
  if (typeof v === "number") return v;
  if (v == null) return NaN;
  let t = String(v).replace(/[€\s%]/g, "").replace(/[^\d,.\-]/g, "");
  if (!t) return NaN;
  if (t.includes(",") && t.includes(".")) t = t.lastIndexOf(",") > t.lastIndexOf(".") ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  else if (t.includes(",")) t = t.replace(",", ".");
  return parseFloat(t);
}
export function pDay(v: any): string {
  if (typeof v === "number" && v > 20000) return new Date(Math.round((v - 25569) * 864e5)).toISOString().slice(0, 10);
  const t = String(v || "").trim();
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[0];
  m = t.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return t;
}
export function parseCSV(text: string): string[][] {
  const first = text.split(/\r?\n/)[0], d = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ";" : first.includes("\t") ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === d) { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cur); cur = ""; if (row.some((x) => x !== "")) rows.push(row); row = []; }
    else cur += c;
  }
  row.push(cur);
  if (row.some((x) => x !== "")) rows.push(row);
  return rows;
}
export function tabel(rows: any[][]) {
  const head = rows[0].map((h) => String(h).trim());
  return { head, rijen: rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]]))) as Rij[], map: autoMap(head) };
}
/** Voorbeelddata: een fietsmerk, 21 dagen, vijf advertenties. Zelfde reeks als het prototype. */
export function voorbeeldMeta(): any[][] {
  const ads: [string, number, number, number, number, number][] = [["Winterbanden video 15s", 0.4, 0.021, -0.55, 6.2, 0.05], ["Carrousel verlichting", 0.06, 0.019, 0, 5.1, 0.11], ["Statisch beeld korting", 0.25, 0.009, 0, 7.4, 0.03], ["UGC review forens", 0.21, 0.016, -0.1, 6.0, 0.06], ["Story nachtvorst", 0.08, 0.007, 0, 6.8, 0]];
  const head = ["Dag", "Campagnenaam", "Advertentienaam", "Besteed bedrag (EUR)", "Weergaven", "Bereik", "Frequentie", "Linkklikken", "Resultaten"], rows: any[][] = [head];
  const start = new Date(Date.now() - 21 * 864e5);
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let d = 0; d < 21; d++) {
    const day = new Date(start.getTime() + d * 864e5).toISOString().slice(0, 10);
    for (const [n, share, ctr, decay, cpm, cvr] of ads) {
      const sp = 150 * share * (0.85 + rnd() * 0.3), im = Math.round((sp / cpm) * 1000), c = ctr * (1 + (decay * d) / 20) * (0.9 + rnd() * 0.2), cl = Math.round(im * c), fq = n.startsWith("Winter") ? 1.4 + d * 0.12 : 1.3 + d * 0.04;
      rows.push([day, "Winter 2026", n, sp.toFixed(2).replace(".", ","), im, Math.round(im / fq), fq.toFixed(2).replace(".", ","), cl, Math.round(cl * cvr * (0.8 + rnd() * 0.4))]);
    }
  }
  return rows;
}
export const eur = (v: number) => (isFinite(v) ? v.toLocaleString("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: v < 10 ? 2 : 0 }) : "–");
export const pct = (v: number) => (isFinite(v) ? (v * 100).toLocaleString("nl-NL", { maximumFractionDigits: 2 }) + "%" : "–");
export const num = (v: number) => (isFinite(v) ? Math.round(v).toLocaleString("nl-NL") : "–");

export type Inzicht = { t: string; b: string; v: string };
export function metaCalc(rijen: Rij[] | null, m: Kaart) {
  const g = (r: Rij, k: string) => (m[k] ? pNum(r[m[k] as string]) : NaN);
  if (!rijen || !m.spend || !m.impr) return null;
  const by: Record<string, any> = {};
  const T = { spend: 0, impr: 0, clicks: 0, results: 0, value: 0, fw: 0 };
  for (const r of rijen) {
    const sp = g(r, "spend"), im = g(r, "impr");
    if (!isFinite(sp) || !isFinite(im)) continue;
    const key = m.ad ? r[m.ad] || "(zonder naam)" : m.campaign ? r[m.campaign] || "(zonder naam)" : "Alle advertenties";
    const a = by[key] || (by[key] = { naam: key, spend: 0, impr: 0, clicks: 0, results: 0, value: 0, fw: 0, days: {} });
    const cl = g(r, "clicks") || 0, rs = g(r, "results") || 0, vl = g(r, "value") || 0, fq = g(r, "freq");
    a.spend += sp; a.impr += im; a.clicks += cl; a.results += rs; a.value += vl; if (isFinite(fq)) a.fw += fq * im;
    T.spend += sp; T.impr += im; T.clicks += cl; T.results += rs; T.value += vl; if (isFinite(fq)) T.fw += fq * im;
    if (m.day) { const d = pDay(r[m.day]); const x = a.days[d] || (a.days[d] = { impr: 0, clicks: 0 }); x.impr += im; x.clicks += cl; }
  }
  const useRes = !!m.results && T.results > 0;
  const ads = Object.values(by).map((a: any) => Object.assign(a, { share: a.spend / T.spend, ctr: a.impr ? a.clicks / a.impr : NaN, cpc: a.clicks ? a.spend / a.clicks : NaN, cpr: a.results ? a.spend / a.results : Infinity, freq: a.fw && a.impr ? a.fw / a.impr : NaN })).sort((x: any, y: any) => y.spend - x.spend);
  const kost = (a: any) => (useRes ? a.cpr : a.cpc), kn = useRes ? "kosten per resultaat" : "kosten per klik";
  const ok = ads.filter((a: any) => a.impr >= 1000 && isFinite(kost(a))), med = ok.length ? ok.map(kost).sort((x: number, y: number) => x - y)[Math.floor(ok.length / 2)] : NaN;
  const I: Inzicht[] = [];
  ok.filter((a: any) => kost(a) > 1.5 * med && a.share > 0.1).forEach((a: any) => I.push({ t: `${a.naam} kost veel en levert relatief weinig op`, b: `${pct(a.share)} van het budget, ${kn} ${eur(kost(a))} tegen een mediaan van ${eur(med)}.`, v: "Komt dit door het beeld, de boodschap of de doelgroep?" }));
  ok.filter((a: any) => kost(a) < 0.7 * med && a.share < 0.08 && (!useRes || a.results >= 3)).forEach((a: any) => I.push({ t: `${a.naam} presteert goed met weinig budget`, b: `${kn} ${eur(kost(a))}, ${Math.round((1 - kost(a) / med) * 100)}% onder de mediaan, maar slechts ${pct(a.share)} van het budget.`, v: "Blijft dit zo als het meer budget krijgt, of is het een kleine groep die al overtuigd was?" }));
  if (m.day) ads.filter((a: any) => Object.keys(a.days).length >= 6).forEach((a: any) => {
    const ds = Object.keys(a.days).sort(), h = Math.floor(ds.length / 2);
    const c = (arr: string[]) => { const s = arr.reduce((t, d) => ({ i: t.i + a.days[d].impr, c: t.c + a.days[d].clicks }), { i: 0, c: 0 }); return s.i ? s.c / s.i : NaN; };
    const c1 = c(ds.slice(0, h)), c2 = c(ds.slice(h));
    if (c1 && c2 / c1 < 0.75) I.push({ t: `${a.naam} slijt`, b: `De CTR zakte van ${pct(c1)} naar ${pct(c2)} tussen de eerste en tweede helft van de periode${isFinite(a.freq) ? `, bij een frequentie van ${a.freq.toLocaleString("nl-NL", { maximumFractionDigits: 1 })}` : ""}.`, v: "Is het beeld uitgekeken, of verandert de doelgroep die het ziet?" });
  });
  if (useRes) ads.filter((a: any) => a.results === 0 && a.share > 0.05).forEach((a: any) => I.push({ t: `${a.naam} levert niets op`, b: `${eur(a.spend)} besteed (${pct(a.share)} van het budget), nul resultaten.`, v: "Klopt het doel van deze advertentie met wat je meet?" }));
  const F = T.fw && T.impr ? T.fw / T.impr : NaN;
  if (F > 3.5) I.push({ t: "Dezelfde mensen zien je advertenties vaak", b: `Gemiddelde frequentie ${F.toLocaleString("nl-NL", { maximumFractionDigits: 1 })}.`, v: "Is de doelgroep te klein voor dit budget, of is dat juist de bedoeling?" });
  if (ads[0] && ads[0].share > 0.5 && ads.length > 2) I.push({ t: "Eén advertentie krijgt het meeste budget", b: `${ads[0].naam} krijgt ${pct(ads[0].share)} van het budget.`, v: "Is dat een bewuste keuze, of heeft het algoritme het zo verdeeld?" });
  return { T, ads, useRes, kn, med, F, I, weinig: ads.filter((a: any) => a.impr < 1000).length };
}
