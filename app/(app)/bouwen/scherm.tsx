"use client";
// Bouwmodule: je eerste tool in een middag. De spec-maker zet je antwoorden om
// in een spec; of die klopt met wat je bedoelt, beoordeel je zelf.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app";
import { Cover } from "@/components/Cover";
import { LesBox } from "@/components/Les";
import { BOUW, SPECW } from "@/lib/bouwen";
import type { Les } from "@/lib/lessen";

export function Bouwen({ les }: { les: Les }) {
  const { data, setBouw, nieuwExp, toast } = useApp();
  const router = useRouter();
  const b = data.bouw, f = b.velden;
  const [q, setQ] = useState<(number | null)[]>([null, null, null]);
  const [bezig, setBezig] = useState(false);
  const veld = (k: string) => ({ value: f[k] || "", onChange: (e: { target: { value: string } }) => setBouw({ velden: { ...f, [k]: e.target.value } }) });

  async function maakSpec() {
    if (!f.vraag || !f.doen) return toast("Vul minstens de vraag en wat het moet doen in");
    setBezig(true);
    try {
      const r = await fetch("/api/coach", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "spec", context: `Vraag: ${f.vraag}\nVoor wie: ${f.wie || ""}\nWat het moet doen: ${f.doen}\nWat het niet doet: ${f.niet || ""}\nStijl: eenvoudig, mobiel eerst` }),
      });
      const d = await r.json().catch(() => ({ error: "Onverwacht antwoord." }));
      if (!r.ok || d.error) throw new Error(d.error || "Er ging iets mis.");
      setBouw({ spec: d.text });
    } catch (e) {
      toast(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "De spec maken lukte niet. Probeer het opnieuw.");
    }
    setBezig(false);
  }
  async function maakKaart() {
    try {
      const e = await nieuwExp({ titel: f.vraag || "Mijn eerste tool", bouw: f.doen || "", spec: b.spec || "" });
      router.push(`/ronde/${e.id}`);
    } catch {
      toast("Een kaart maken lukte niet.");
    }
  }
  const vink = (i: number, aan: boolean) => setBouw({ gedaan: aan ? [...new Set([...b.gedaan, i])].sort() : b.gedaan.filter((x) => x !== i) });

  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Bouwmodule</div>
        <h1>Je eerste tool in een middag.</h1>
        <p>Je leert geen tool. Tools veranderen elke maand. Je leert het patroon dat blijft: vraag, spec, bouwen, testen, live.</p>
      </div>
      <div style={{ marginTop: 20 }}>
        <LesBox les={les} />
        <details className="oef">
          <summary><span className="pt" aria-hidden="true">✦</span><span>Proeftuin: Wat mist er in deze spec?<small>Drie specs. Herken wat een goede spec nodig heeft</small></span></summary>
          <div className="lb">
            {SPECW.map((w, j) => (
              <div key={w.s} className="case" style={{ marginTop: 8 }}>
                <div className="cm">Spec {j + 1} van {SPECW.length}: wat mist er?</div>
                <div className="cs" style={{ fontSize: "1.02rem" }}>{w.s}</div>
                <div className="minis" style={{ flexWrap: "wrap" }}>
                  {w.opt.map((o, k) => <button key={o} aria-pressed={q[j] === k} onClick={() => setQ(Object.assign([...q], { [j]: k }))}>{o}</button>)}
                </div>
                {q[j] !== null && <div className={`fb ${q[j] === w.ok ? "ok" : "no"}`}><b>{q[j] === w.ok ? "Goed." : "Niet helemaal."}</b> {w.uit}</div>}
              </div>
            ))}
          </div>
        </details>
      </div>

      {BOUW.map(([h, t, g], i) => {
        const af = b.gedaan.includes(i);
        return (
          <section key={h} className={`step ${af ? "done" : ""}`}>
            <div className="step-h"><b>{af ? "✓" : i + 1}</b><h2>{h}</h2></div>
            <div className="step-b">
              <p style={{ fontWeight: 400, lineHeight: 1.55 }}>{t}</p>
              <div className="chks" style={{ marginTop: 12 }}>{g.map((x) => <span key={x} className={af ? "y" : ""}>{x}</span>)}</div>
              {i === 1 && (
                <div style={{ marginTop: 18 }}>
                  <label className="f"><span>De vraag</span><input type="text" {...veld("vraag")} placeholder="Wat kost mijn auto me per maand echt?" /></label>
                  <label className="f"><span>Voor wie</span><input type="text" {...veld("wie")} placeholder="Forensen met een auto van de zaak" /></label>
                  <label className="f"><span>Wat moet het doen?</span><textarea {...veld("doen")} placeholder="Wat vult iemand in, wat krijgt hij terug?" /></label>
                  <label className="f"><span>Wat doet het niet?</span><input type="text" {...veld("niet")} placeholder="Geen account, geen opslag" /></label>
                  <div className="btns"><button className="btn" onClick={maakSpec} disabled={bezig}>{bezig ? <><span className="busy"></span> Spec wordt gemaakt</> : "Maak mijn spec"}</button></div>
                  {b.spec && (
                    <>
                      <label className="f" style={{ marginTop: 18 }}><span>Je spec</span><small>Lees hem kritisch en pas hem aan: klopt dit met wat je bedoelt?</small><textarea className="big" value={b.spec} onChange={(e) => setBouw({ spec: e.target.value })} /></label>
                      <div className="btns"><button className="btn ghost sm" onClick={() => navigator.clipboard.writeText(b.spec).then(() => toast("Spec gekopieerd"), () => toast("Kopiëren lukte niet"))}>Kopieer spec</button></div>
                    </>
                  )}
                </div>
              )}
              <label className="afvink"><input type="checkbox" checked={af} onChange={(e) => vink(i, e.target.checked)} />Gedaan</label>
            </div>
          </section>
        );
      })}

      {b.gedaan.length === BOUW.length && (
        <section className="next">
          <Cover seed="bouwklaar" w={800} h={360} cls="lg" />
          <span className="k">Klaar</span>
          <h2>Maak er een experimentkaart van.</h2>
          <p>Dan staat je eerste tool in je library, met de spec erbij.</p>
          <div className="btns"><button className="btn" onClick={maakKaart}>Maak kaart</button></div>
        </section>
      )}
    </main>
  );
}
