"use client";
// De Rolscan zelf: rol, week, uitkomst. Gebruikt in het platform en op de openbare pagina.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Cover } from "@/components/Cover";
import { deelbeeld } from "@/lib/deelbeeld";
import { ROLLEN, type Rol } from "@/lib/types";

export type Taak = { taak: string; uren?: number; label: string; waarom: string };
export type Uitkomst = {
  vraag?: string; taken?: Taak[]; uitvoerend: number; uitvindend: number; overig_uren?: number; geschat?: boolean;
  experiment?: { signaal?: string; hypothese?: string; bouw?: string; meten?: string }; kort?: string; afsluiting?: string;
};

const vastLabel = (l: string) => {
  const s = String(l || "").toLowerCase().trim();
  return s.startsWith("uitvo") ? "uitvoerend" : s.startsWith("ov") ? "overig" : s.startsWith("ui") ? "uitvindend" : "overig";
};

// Een uitkomst van de openbare scan wacht in de browser tot je bent ingelogd.
const WACHT = "uitvinder-scan-wacht";
export function leesWacht(): { rol: Rol; r: Uitkomst } | null {
  try {
    const w = JSON.parse(localStorage.getItem(WACHT) || "null");
    return w && typeof w.r?.uitvindend === "number" && ROLLEN.includes(w.rol) ? w : null;
  } catch { return null; }
}
export function zetWacht(w: { rol: Rol; r: Uitkomst } | null) {
  try { if (w) localStorage.setItem(WACHT, JSON.stringify(w)); else localStorage.removeItem(WACHT); } catch {}
}

export function Scan({ startRol, eerste, wacht, onUitkomst, onder }: {
  startRol: Rol; eerste: boolean; wacht?: boolean;
  onUitkomst?: (rol: Rol, r: Uitkomst) => void;
  onder: (rol: Rol, r: Uitkomst) => ReactNode;
}) {
  const [rol, setRol] = useState<Rol>(startRol);
  const [week, setWeek] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const [r, setR] = useState<Uitkomst | null>(null);
  const uit = useRef<HTMLElement>(null);

  // Een scan die je zonder account deed, staat hier klaar om te bewaren.
  useEffect(() => {
    if (!wacht) return;
    const w = leesWacht();
    if (w) { setRol(w.rol); setR(w.r); }
  }, [wacht]);

  async function scan() {
    setFout("");
    if (week.trim().length < 20) return setFout("Beschrijf je week iets uitgebreider: wat deed je, hoeveel tijd ging erin en voor wie?");
    setBezig(true);
    try {
      const res = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rol, week }) });
      if (res.status === 429) throw new Error("Het is even druk. Wacht een minuut en probeer het opnieuw.");
      const d = await res.json().catch(() => ({ error: "Onverwacht antwoord." }));
      if (!res.ok || d.error) throw new Error(d.error || "Er ging iets mis.");
      if (!d.vraag && typeof d.uitvindend !== "number") throw new Error("De scan gaf geen bruikbare uitkomst. Probeer het opnieuw.");
      setR(d);
      if (!d.vraag) { onUitkomst?.(rol, d); setTimeout(() => uit.current?.scrollIntoView({ behavior: "smooth" }), 50); }
    } catch (e) {
      setFout(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "De scan lukte niet. Probeer het opnieuw.");
    }
    setBezig(false);
  }

  const pct = r && !r.vraag ? Math.round(r.uitvindend) : 0;
  return (
    <>
      <section className="step">
        <div className="step-h"><b>1</b><h2>Je rol</h2></div>
        <div className="step-b">
          <div className="seg" role="group" aria-label="Rol">
            {ROLLEN.map((x) => <button key={x} aria-pressed={rol === x} onClick={() => setRol(x)}>{x}</button>)}
          </div>
        </div>
      </section>
      <section className="step">
        <div className="step-h"><b>2</b><h2>Je afgelopen werkweek</h2></div>
        <div className="step-b">
          <label className="f">
            <span>Wat deed je, ongeveer hoeveel tijd ging erin, en voor wie?</span>
            <textarea className="big" value={week} onChange={(e) => setWeek(e.target.value)} placeholder="Maandag 4 uur social posts gemaakt voor klant X op basis van de contentkalender. Dinsdag 2 uur overleg over een nieuwe campagne..." />
          </label>
          <div className="btns">
            <button className="btn" onClick={scan} disabled={bezig}>{bezig ? <><span className="busy"></span> De AI leest je week</> : "Scan mijn week"}</button>
          </div>
          <p className="hint" style={{ marginTop: 12 }}>Je beschrijving gaat alleen naar de AI en wordt niet opgeslagen. De uitkomst bewaar je zelf, en alleen jij ziet hem.</p>
          {fout && <p className="err" style={{ marginTop: 14 }} role="alert">{fout}</p>}
        </div>
      </section>

      {r?.vraag && (
        <section className="step">
          <div className="step-h"><b>?</b><h2>Nog één vraag</h2></div>
          <div className="step-b">
            <p style={{ fontSize: "1.1rem" }}>{r.vraag}</p>
            <p className="hint" style={{ marginTop: 8 }}>Vul je beschrijving hierboven aan en scan opnieuw.</p>
          </div>
        </section>
      )}

      {r && !r.vraag && (
        <section ref={uit} style={{ marginTop: "clamp(40px,7vw,64px)" }}>
          <div className="total">
            <Cover seed={"total" + r.uitvindend} w={800} h={360} cls="lg" />
            <span className="k">{eerste ? "Jouw nulmeting" : "Jouw meting"}{r.geschat ? " (tijd geschat)" : ""}</span>
            <b>{pct}% uitvinder</b>
            <div className="ratio" aria-hidden="true"><i style={{ width: `${pct}%` }}></i></div>
            <p>{r.afsluiting || ""}</p>
          </div>
          <div className="subs">
            <div className="v"><span>Uitvoerend</span><b>{Math.round(r.uitvoerend)}%</b></div>
            <div className="o"><span>Uitvindend</span><b>{pct}%</b></div>
            <div className="x"><span>Overig</span><b>{r.overig_uren ?? 0} u</b></div>
          </div>
          <div className="grp"><span>Je week</span><span>{(r.taken || []).length} taken</span></div>
          <ul className="list">
            {(r.taken || []).map((t0, i) => {
              const t = { ...t0, label: vastLabel(t0.label) };
              return (
              <li key={i} className="row">
                <span className="nm">{t.taak}{t.uren ? <> <span className="hint">{t.uren} u</span></> : null}</span>
                <span className={`tag ${t.label === "uitvindend" ? "ui" : t.label === "overig" ? "ov" : "uv"}`}>{t.label}</span>
                <span className="why">{t.waarom}</span>
              </li>
              );
            })}
          </ul>
          <div className="exp">
            <span className="k">Je experiment voor volgende week</span>
            <dl>
              <div><dt>Signaal</dt><dd>{r.experiment?.signaal}</dd></div>
              <div><dt>Hypothese</dt><dd>{r.experiment?.hypothese}</dd></div>
              <div><dt>Wat je bouwt</dt><dd>{r.experiment?.bouw}</dd></div>
              <div><dt>Hoe je meet</dt><dd>{r.experiment?.meten}</dd></div>
            </dl>
          </div>
          <div className="btns" style={{ marginTop: 20 }}><button className="btn ghost" onClick={() => deelbeeld(r, eerste)}>Download deelbeeld</button></div>
          {onder(rol, r)}
        </section>
      )}
    </>
  );
}
