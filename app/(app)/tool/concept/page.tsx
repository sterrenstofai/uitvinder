"use client";
// Concept-machine: dertig routes als ruw materiaal. Jij kiest, combineert en verdedigt.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app";
import { ToolUitleg } from "@/components/ToolUitleg";
import { curExp } from "@/lib/afgeleid";
import { VOORBEELDROUTES, type Route } from "@/lib/tools";

export default function ConceptMachine() {
  const { data, nieuwExp, toast } = useApp();
  const router = useRouter();
  const lopend = curExp(data);
  const [f, setF] = useState({ klant: "", merk: "", wie: "", vraag: "", rand: "", inv: data.inv.zin || "" });
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const [type, setType] = useState("alle");
  const [pick, setPick] = useState<number[]>([]);
  const [x, setX] = useState({ concept: "", waarom: "", eigen: "" });
  const veld = (k: keyof typeof f) => ({ value: f[k], onChange: (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value }) });
  const veldX = (k: keyof typeof x) => ({ value: x[k], onChange: (e: { target: { value: string } }) => setX({ ...x, [k]: e.target.value }) });

  async function maak() {
    if (!f.merk || !f.vraag) return toast("Vul minstens het merk en de vraag in");
    setBezig(true); setFout("");
    try {
      const r = await fetch("/api/coach", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "concept", context: `Klant: ${f.klant || ""}\nMerk: ${f.merk}\nVoor wie: ${f.wie || ""}\nVraag of signaal: ${f.vraag}\nRandvoorwaarden: ${f.rand || "geen"}\nInvalshoek van de gebruiker: ${f.inv || "geen"}` }),
      });
      const d = await r.json().catch(() => ({ error: "Onverwacht antwoord." }));
      if (!r.ok || d.error) throw new Error(d.error || "Er ging iets mis.");
      if (!d.routes || !d.routes.length) throw new Error("Er kwamen geen routes terug.");
      setRoutes(d.routes.map((q: Route) => ({ titel: String(q.titel || ""), idee: String(q.idee || ""), type: String(q.type || "overig").toLowerCase(), invalshoek: Boolean(q.invalshoek) })));
      setDemo(false); setPick([]); setType("alle");
    } catch (e) {
      setFout((e instanceof Error && e.message !== "Failed to fetch" ? e.message : "De routes maken lukte niet.") + " Je kunt de voorbeeldroutes bekijken.");
    }
    setBezig(false);
  }
  function kies(i: number, aan: boolean) {
    if (aan && pick.length >= 3) return toast("Maximaal drie op je shortlist");
    setPick(aan ? [...pick, i] : pick.filter((y) => y !== i));
  }
  async function ronde() {
    if (!routes || !pick.length) return toast("Kies eerst routes");
    // Toolcontract: zonder verantwoording en eigen toevoeging wordt het geen ronde.
    if (!x.concept.trim() || !x.waarom.trim() || !x.eigen.trim()) return toast("Vul je concept in, waarom, en wat je zelf toevoegde");
    try {
      const e = await nieuwExp({
        klant: f.klant || "", titel: x.concept.split(/[.\n]/)[0].slice(0, 70), signaal: f.vraag || "", bouw: x.concept,
        keuze: `${x.waarom}\nZelf toegevoegd: ${x.eigen}\nGekozen uit: ${pick.map((i) => routes[i].titel).join(", ")}`, tool: "Concept-machine", bron_tool: "concept",
      });
      toast("Ronde gestart");
      router.push(`/ronde/${e.id}`);
    } catch { toast("Een ronde starten lukte niet."); }
  }

  const lijst = (routes || []).map((r, i) => ({ ...r, i })).filter((r) => type === "alle" || (type === "invalshoek" ? r.invalshoek : r.type === type));
  const typen = ["alle", "invalshoek", ...new Set((routes || []).map((r) => r.type))];

  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Library, tool</div>
        <h1>Concept-machine.</h1>
        <p>Dertig routes als ruw materiaal. De machine bedenkt veel, jij kiest wat goed is. Daar zit het verschil tussen een uitvoerder met een AI-tool en een uitvinder.</p>
      </div>
      <ToolUitleg id="concept" />
      <section className="step">
        <div className="step-h"><b>1</b><h2>Briefing</h2></div>
        <div className="step-b">
          {lopend?.signaal && <div className="btns" style={{ marginBottom: 14 }}><button className="btn ghost sm" onClick={() => setF({ ...f, klant: lopend.klant || f.klant, vraag: lopend.signaal })}>Gebruik het signaal van je lopende ronde</button></div>}
          <label className="f"><span>Voor welke klant of welk merk?</span><input type="text" {...veld("klant")} placeholder="Klantnaam" /></label>
          <label className="f"><span>Het merk in één zin</span><input type="text" {...veld("merk")} placeholder="Wat het maakt of doet, en voor wie" /></label>
          <label className="f"><span>Voor wie?</span><input type="text" {...veld("wie")} placeholder="De mensen die je wilt bereiken" /></label>
          <label className="f"><span>De vraag of het signaal</span><textarea {...veld("vraag")} placeholder="Wat speelt er deze week?" /></label>
          <label className="f"><span>Randvoorwaarden</span><input type="text" {...veld("rand")} placeholder="Binnen een middag te maken, geen kortingsacties" /></label>
          <label className="f"><span>Jouw invalshoek</span><small>Gaat mee in de briefing. Minstens vijf routes vertrekken hiervandaan.</small><textarea {...veld("inv")} /></label>
          <div className="btns">
            <button className="btn" onClick={maak} disabled={bezig}>{bezig ? <><span className="busy"></span> Dertig routes worden gemaakt</> : "Maak dertig routes"}</button>
            <button className="btn ghost sm" onClick={() => { setRoutes(VOORBEELDROUTES); setDemo(true); setPick([]); setFout(""); setType("alle"); }}>Bekijk voorbeeldroutes</button>
          </div>
          {fout && <p className="err" style={{ marginTop: 14 }} role="alert">{fout}</p>}
          <p className="hint" style={{ marginTop: 12 }}>Alleen wat je hier invult gaat naar de AI. Zet er geen vertrouwelijke klantinformatie in.</p>
        </div>
      </section>
      {routes && (
        <>
          <section className="step">
            <div className="step-h"><b>2</b><h2>Kies maximaal drie</h2><span>{pick.length} van 3</span></div>
            <div className="step-b">
              {demo && <p className="hint" style={{ marginBottom: 12 }}>Voorbeeldroutes voor een fietsmerk, vanuit de invalshoek van een designer die in de horeca werkte.</p>}
              <div className="seg" style={{ marginBottom: 14 }}>{typen.map((t) => <button key={t} aria-pressed={type === t} onClick={() => setType(t)}>{t === "invalshoek" ? "Vanuit je invalshoek" : t}</button>)}</div>
              <div className="routes">
                {lijst.map((r) => (
                  <label key={r.i} className="route">
                    <input type="checkbox" checked={pick.includes(r.i)} onChange={(e) => kies(r.i, e.target.checked)} />
                    <b>{r.titel}</b><p>{r.idee}</p>
                    <span className={`tag ${r.invalshoek ? "ui" : ""}`}>{r.type}{r.invalshoek ? ", invalshoek" : ""}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>
          <section className="step">
            <div className="step-h"><b>3</b><h2>Combineer en verdedig</h2><span>Hier word je uitvinder</span></div>
            <div className="step-b">
              {pick.length ? (
                <ul className="list" style={{ background: "var(--bg)" }}>{pick.map((i) => <li key={i} className="row"><span className="nm">{routes[i].titel}</span><span className="why">{routes[i].idee}</span></li>)}</ul>
              ) : <p className="hint">Zet eerst routes op je shortlist.</p>}
              <label className="f" style={{ marginTop: 16 }}><span>Jouw concept</span><small>Eén route, of een combinatie. In je eigen woorden.</small><textarea {...veldX("concept")} /></label>
              <label className="f"><span>Waarom dit, en niet de rest?</span><textarea {...veldX("waarom")} /></label>
              <label className="f"><span>Wat heb je zelf toegevoegd?</span><small>Wat stond er niet in de routes, en komt van jou?</small><textarea {...veldX("eigen")} /></label>
              <div className="btns"><button className="btn" onClick={ronde}>Maak er een ronde van</button></div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
