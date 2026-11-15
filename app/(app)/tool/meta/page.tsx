"use client";
// Meta Ads-analyse: de tool laat patronen zien met bewijs, jij kiest wat je test en waarom.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app";
import { ToolUitleg } from "@/components/ToolUitleg";
import { eur, MCOL, metaCalc, MLAB, num, parseCSV, pct, tabel, voorbeeldMeta, type Kaart, type Rij } from "@/lib/meta";

// Excel-bestanden worden gelezen met SheetJS, pas geladen als iemand een Excel-bestand kiest.
function laadXLSX(): Promise<any> {
  const w = window as any;
  if (w.XLSX) return Promise.resolve(w.XLSX);
  return new Promise((ok, nok) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => ok(w.XLSX);
    s.onerror = () => nok(new Error("laden mislukt"));
    document.head.appendChild(s);
  });
}

export default function MetaAnalyse() {
  const { nieuwExp, toast } = useApp();
  const router = useRouter();
  const [klant, setKlant] = useState("");
  const [bestand, setBestand] = useState("");
  const [head, setHead] = useState<string[]>([]);
  const [rijen, setRijen] = useState<Rij[] | null>(null);
  const [map, setMap] = useState<Kaart>({});
  const [ai, setAi] = useState("");
  const [aiBezig, setAiBezig] = useState(false);
  const [pick, setPick] = useState<number | null>(null);
  const [waarom, setWaarom] = useState("");
  const [hyp, setHyp] = useState("");
  const R = useMemo(() => metaCalc(rijen, map), [rijen, map]);

  function zet(rows: any[][], naam: string) {
    const t = tabel(rows);
    setHead(t.head); setRijen(t.rijen); setMap(t.map); setBestand(naam); setAi(""); setPick(null);
  }
  async function kiesBestand(file: File) {
    try {
      if (/\.xlsx?$/i.test(file.name)) {
        const XLSX = await laadXLSX();
        const wb = XLSX.read(await file.arrayBuffer(), { type: "array" }), ws = wb.Sheets[wb.SheetNames[0]];
        zet(XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" }), file.name);
      } else {
        const rows = parseCSV((await file.text()).replace(/^﻿/, ""));
        if (rows.length < 2) return toast("Dit bestand is leeg");
        zet(rows, file.name);
      }
    } catch { toast("Dit bestand kon ik niet lezen"); }
  }
  async function laatMeekijken() {
    if (!R) return;
    setAiBezig(true);
    const T = R.T;
    const sam = `Klant: ${klant || "onbekend"}\nTotaal besteed: ${eur(T.spend)}, CTR ${pct(T.clicks / T.impr)}, ${R.kn} ${eur(R.useRes ? T.spend / T.results : T.spend / T.clicks)}\nPer advertentie (budgetaandeel, CTR, ${R.kn}, frequentie):\n${R.ads.slice(0, 10).map((a: any) => `- ${a.naam}: ${pct(a.share)}, ${pct(a.ctr)}, ${R.useRes ? (isFinite(a.cpr) ? eur(a.cpr) : "geen resultaten") : eur(a.cpc)}, ${isFinite(a.freq) ? a.freq.toFixed(1) : "onbekend"}`).join("\n")}\nWat de tool opviel:\n${R.I.map((x) => `- ${x.t}: ${x.b}`).join("\n") || "- niets bijzonders"}`;
    try {
      const r = await fetch("/api/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "meta", context: sam }) });
      const d = await r.json().catch(() => ({ error: "Onverwacht antwoord." }));
      setAi(!r.ok || d.error ? d.error || "Er ging iets mis." : d.text);
    } catch { setAi("De AI reageert nu niet. Probeer het opnieuw."); }
    setAiBezig(false);
  }
  async function ronde() {
    if (!R || pick === null || !R.I[pick]) return toast("Kies eerst wat je wilt testen");
    // Toolcontract: zonder verantwoording wordt het geen ronde. De database dwingt dat ook af.
    if (!waarom.trim()) return toast("Schrijf op waarom je dit kiest");
    const x = R.I[pick];
    try {
      const e = await nieuwExp({ klant, titel: x.t, signaal: `${x.t}. ${x.b}`, keuze: waarom, hypothese: hyp.includes("...") ? "" : hyp, tool: "Meta Ads-analyse, Meta Ads", bouw: "Test in Meta Ads", bron_tool: "meta" });
      toast("Ronde gestart");
      router.push(`/ronde/${e.id}`);
    } catch { toast("Een ronde starten lukte niet."); }
  }
  const mist = !map.spend || !map.impr;

  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Library, tool</div>
        <h1>Meta Ads-analyse.</h1>
        <p>Zie in een paar minuten waar je advertenties lekken en waar kansen liggen. De tool laat zien wat er gebeurt. Jij kiest wat je test, en waarom.</p>
      </div>
      <ToolUitleg id="meta" />
      <section className="step">
        <div className="step-h"><b>1</b><h2>Je data</h2></div>
        <div className="step-b">
          <label className="f"><span>Voor welke klant?</span><input type="text" value={klant} onChange={(e) => setKlant(e.target.value)} placeholder="Klantnaam" /></label>
          <label className="drop">
            <input type="file" accept=".csv,.xlsx,.xls,.txt" hidden onChange={(e) => { const fl = e.target.files?.[0]; if (fl) kiesBestand(fl); e.target.value = ""; }} />
            <span><b>{bestand || "Kies een export uit Ads Manager"}</b><br /><span className="hint">CSV of Excel. De data blijft in je browser.</span></span>
          </label>
          <div className="btns" style={{ marginTop: 12 }}><button className="btn ghost sm" onClick={() => { zet(voorbeeldMeta(), "Voorbeelddata: fietsmerk, 21 dagen"); if (!klant) setKlant("Fietsmerk Velo"); }}>Probeer met voorbeelddata</button></div>
          <details className="les" style={{ marginTop: 14 }}>
            <summary><span className="pl" aria-hidden="true"></span><span>Zo maak je de export<small>Een minuut werk</small></span></summary>
            <div className="lb">
              <ul>
                <li>Open Ads Manager en kies het niveau Advertenties.</li>
                <li>Kies een periode van minstens 14 dagen.</li>
                <li>Zet bij Verdeling de optie per dag aan, dan ziet de tool ook of een advertentie slijt.</li>
                <li>Kies Exporteren, tabelgegevens, als CSV of Excel.</li>
              </ul>
              <p className="hint">Live koppelen met Meta komt later. Daarvoor moet Meta de koppeling eerst goedkeuren.</p>
            </div>
          </details>
        </div>
      </section>

      {rijen && (
        <section className="step">
          <div className="step-h"><b>2</b><h2>Kolommen</h2><span>{bestand}, {rijen.length} rijen</span></div>
          <div className="step-b">
            <details className="les" open={mist || undefined}>
              <summary><span className="pt" aria-hidden="true">✓</span><span>{Object.keys(map).length} van {Object.keys(MCOL).length} kolommen herkend<small>{mist ? "Kies besteed bedrag en weergaven, die zijn nodig" : "Klopt er een niet? Pas hem hier aan"}</small></span></summary>
              <div className="lb">
                <div className="maps">
                  {Object.keys(MCOL).map((k) => (
                    <label key={k}>{MLAB[k]}
                      <select value={map[k] || ""} onChange={(e) => { const m = { ...map }; if (e.target.value) m[k] = e.target.value; else delete m[k]; setMap(m); setPick(null); }}>
                        <option value="">Niet gebruiken</option>
                        {head.map((h) => <option key={h}>{h}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </section>
      )}
      {rijen && !R && <section className="step"><div className="step-b"><p className="err">Ik mis het besteed bedrag of de weergaven. Kies die kolommen hierboven.</p></div></section>}

      {R && (
        <>
          <section className="step">
            <div className="step-h"><b>3</b><h2>Wat de data laat zien</h2></div>
            <div className="step-b">
              <div className="kpis">
                <div><span>Besteed</span><b>{eur(R.T.spend)}</b></div>
                <div><span>CTR</span><b>{pct(R.T.clicks / R.T.impr)}</b></div>
                <div><span>{R.useRes ? "Kosten per resultaat" : "Kosten per klik"}</span><b>{eur(R.useRes ? R.T.spend / R.T.results : R.T.spend / R.T.clicks)}</b></div>
                <div><span>{R.T.value ? "ROAS" : "Resultaten"}</span><b>{R.T.value ? (R.T.value / R.T.spend).toLocaleString("nl-NL", { maximumFractionDigits: 2 }) : num(R.T.results)}</b></div>
              </div>
              <div className="grp" style={{ marginTop: 26 }}><span>Wat opvalt</span><span>Kies er straks één</span></div>
              {R.I.length ? (
                <div className="ins">
                  {R.I.map((x, i) => (
                    <label key={x.t} className="in">
                      <input type="radio" name="mapick" checked={pick === i} onChange={() => { setPick(i); if (!hyp) setHyp("Als ik ..., dan verwacht ik ..., omdat ..."); }} />
                      <b>{x.t}</b><p>{x.b}</p><p className="v">{x.v}</p>
                    </label>
                  ))}
                </div>
              ) : <div className="empty">Niets springt eruit. Dat is ook een uitkomst: kijk naar de tabel hieronder, of kies een langere periode.</div>}
              {R.weinig > 0 && <p className="hint" style={{ marginTop: 10 }}>{R.weinig} advertentie{R.weinig > 1 ? "s hebben" : " heeft"} minder dan 1.000 weergaven en {R.weinig > 1 ? "tellen" : "telt"} niet mee in de vergelijking. Te weinig data om iets over te zeggen.</p>}
              <div className="grp" style={{ marginTop: 26 }}><span>Per advertentie</span><span>Op budget</span></div>
              <div className="scroll">
                <table className="adt">
                  <thead><tr><th>Advertentie</th><th>Budget</th><th>CTR</th><th>{R.useRes ? "Per resultaat" : "Per klik"}</th><th>Freq.</th></tr></thead>
                  <tbody>
                    {R.ads.slice(0, 10).map((a: any) => (
                      <tr key={a.naam}><td>{a.naam}</td><td>{pct(a.share)}</td><td>{pct(a.ctr)}</td><td>{R.useRes ? (isFinite(a.cpr) ? eur(a.cpr) : "geen") : eur(a.cpc)}</td><td>{isFinite(a.freq) ? a.freq.toLocaleString("nl-NL", { maximumFractionDigits: 1 }) : "–"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          <section className="step">
            <div className="step-h"><b>4</b><h2>AI-duiding</h2><span>Optioneel</span></div>
            <div className="step-b">
              <p className="hint">De AI krijgt alleen de samenvatting hierboven, geen ruwe export. Hij doet geen voorstel om budget te verschuiven, maar zet mogelijke verklaringen naast elkaar en vraagt wat jij zou testen.</p>
              <div className="btns" style={{ marginTop: 14 }}><button className="btn ghost sm" onClick={laatMeekijken} disabled={aiBezig}>{aiBezig ? <><span className="busy"></span> Leest de data</> : "Laat de AI meekijken"}</button></div>
              {ai && <div className="coach" style={{ whiteSpace: "pre-wrap" }}>{ai}</div>}
            </div>
          </section>
          <section className="step">
            <div className="step-h"><b>5</b><h2>Jouw oordeel</h2><span>Hier word je uitvinder</span></div>
            <div className="step-b">
              <p>{pick !== null && R.I[pick] ? <>Je koos: <b>{R.I[pick].t}</b></> : "Kies hierboven wat je wilt testen."}</p>
              <label className="f" style={{ marginTop: 14 }}><span>Waarom deze, en niet een van de andere?</span><textarea value={waarom} onChange={(e) => setWaarom(e.target.value)} placeholder="Wat maakt dit belangrijker voor de klant?" /></label>
              <label className="f"><span>Je hypothese</span><textarea value={hyp} onChange={(e) => setHyp(e.target.value)} placeholder="Als ik ..., dan verwacht ik ..., omdat ..." /></label>
              <div className="btns"><button className="btn" onClick={ronde}>Maak er een ronde van</button></div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
