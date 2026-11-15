"use client";
// Portfolio en eindopdracht. Een mens beoordeelt, nooit de AI.
import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app";
import { Cover } from "@/components/Cover";
import { afgerond, expTitel, fmtD } from "@/lib/afgeleid";
import { getal1, RUBRIC } from "@/lib/toetsing";

const woorden = (t: string) => (t.trim().match(/\S+/g) || []).length;

export default function Portfolio() {
  const { data, modus, setPortfolio, setEind, dienIn, toast } = useApp();
  const [bezig, setBezig] = useState(false);
  const af = afgerond(data);
  const pf = data.portfolio.filter((id) => af.some((e) => e.id === id));
  const wc = woorden(data.eind.reflectie);
  const ingediend = data.eind.ingediend_op;
  const b = data.beoordeling;
  const eisen: [boolean, string][] = [
    [af.length >= 8, `Minimaal 8 rondes afgerond (nu ${af.length})`],
    [pf.length === 3, `Drie sterkste kaarten gekozen (nu ${pf.length})`],
    [!!data.eind.pitch_link.trim(), "Link naar je pitch"],
    [wc >= 1000 && wc <= 1500, `Reflectie van 1.000 tot 1.500 woorden (nu ${wc.toLocaleString("nl-NL")})`],
    [data.metingen.some((m) => m.week === 12), "Eindmeting in week 12"],
  ];
  const klaar = eisen.every((e) => e[0]);

  function kies(id: string, aan: boolean) {
    if (aan && pf.length >= 3) return toast("Kies er maximaal drie");
    setPortfolio(aan ? [...pf, id] : pf.filter((x) => x !== id)).catch(() => toast("Opslaan lukte niet."));
  }
  async function indienen() {
    if (!confirm("Na het indienen kun je je portfolio en eindopdracht niet meer wijzigen. Doorgaan?")) return;
    setBezig(true);
    try {
      await dienIn();
      toast("Ingediend");
    } catch {
      toast("Indienen lukte niet. Probeer het opnieuw.");
    }
    setBezig(false);
  }

  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Portfolio en eindopdracht</div>
        <h1>Laat zien dat je uitvinder bent.</h1>
        <p>Je eindbeoordeling bestaat uit je portfolio (60%) en je eindopdracht (40%). Een beoordelaar kijkt ernaar, niet de AI.</p>
      </div>

      {b && b.cijfer !== null ? (
        <section className="next">
          <Cover seed="cijfer" w={800} h={360} cls="lg" />
          <span className="k">Vastgesteld op {fmtD(b.vastgesteld_op!)}{b.beoordelaar_naam ? `, door ${b.beoordelaar_naam}` : ""}</span>
          <div className="cijfer">{getal1(b.cijfer)}</div>
          <p>
            Portfolio {b.scores.portfolio !== undefined ? getal1(b.scores.portfolio) : "–"}, eindopdracht {b.scores.eindopdracht !== undefined ? getal1(b.scores.eindopdracht) : "–"}.{" "}
            {b.cijfer >= 5.5 ? "Je bent geslaagd." : "Nog niet voldoende. Je mag het onderdeel dat onder voldoende bleef één keer opnieuw inleveren."}
          </p>
          {b.cijfer >= 5.5 && <div className="btns"><Link className="btn" href="/certificaat">Bekijk je certificaat</Link></div>}
        </section>
      ) : ingediend ? (
        <section className="next">
          <Cover seed="ingediend" w={800} h={360} cls="lg" />
          <span className="k">Ingediend op {fmtD(ingediend)}</span>
          <h2>Je inzending ligt bij de beoordelaar.</h2>
          <p>Je hoort binnen tien werkdagen de uitslag. Tot die tijd ligt je inzending vast.</p>
        </section>
      ) : null}

      <section className="step">
        <div className="step-h"><b>1</b><h2>Kies je drie sterkste kaarten</h2><span>{pf.length} van 3</span></div>
        <div className="step-b">
          <p className="hint">Kies de kaarten die het best laten zien hoe je werkt. Elke kaart wordt op vijf criteria beoordeeld.</p>
          {af.length ? af.map((e) => (
            <label key={e.id} className="pk">
              <input type="checkbox" checked={pf.includes(e.id)} disabled={!!ingediend} onChange={(ev) => kies(e.id, ev.target.checked)} />
              <b>{expTitel(e)}</b>
              <span className="hint">{e.klant}{e.uitkomst ? `${e.klant ? ", " : ""}${e.uitkomst}` : ""}</span>
            </label>
          )) : <div className="empty">Nog geen afgeronde rondes.</div>}
        </div>
      </section>

      <section className="step">
        <div className="step-h"><b>2</b><h2>Zo wordt het beoordeeld</h2></div>
        <div className="step-b">
          <p>Vijf criteria per kaart, elk op vier niveaus: {RUBRIC.join(", ").toLowerCase()}.</p>
          <div className="btns" style={{ marginTop: 12 }}><Link className="btn ghost sm" href="/studiewijzer">Lees de rubric in de studiewijzer</Link></div>
        </div>
      </section>

      <section className="step">
        <div className="step-h"><b>3</b><h2>Eindopdracht</h2><span>Week 12</span></div>
        <div className="step-b">
          <label className="f">
            <span>Link naar je pitch</span>
            <small>Tien minuten voor een klant, echt of gesimuleerd. Een video of slides met opname.</small>
            <input type="url" value={data.eind.pitch_link} disabled={!!ingediend} onChange={(e) => setEind({ pitch_link: e.target.value })} placeholder="https://" />
          </label>
          <label className="f">
            <span>Reflectieverslag</span>
            <small>Laat met je metingen en kaarten zien hoe je werk en denken verschoven zijn. Waar zat je in week 1? Wat bleek anders dan je dacht? Wat ging tegen? Wat ga je nu anders doen, vanuit je invalshoek?</small>
            <textarea className="big" style={{ minHeight: 300 }} value={data.eind.reflectie} disabled={!!ingediend} onChange={(e) => setEind({ reflectie: e.target.value })} />
            <small>{wc.toLocaleString("nl-NL")} woorden</small>
          </label>
        </div>
      </section>

      {!ingediend && (
        <>
          <div className="grp"><span>Indienen</span></div>
          <div className="need">{eisen.map(([y, t]) => <span key={t} className={y ? "y" : ""}>{t}</span>)}</div>
          <div className="btns" style={{ marginTop: 16 }}>
            <button className="btn" onClick={indienen} disabled={!klaar || bezig}>{bezig ? "Bezig…" : "Dien in bij de beoordelaar"}</button>
          </div>
          {modus === "lokaal" && <p className="hint" style={{ marginTop: 12 }}>In voorbeeldmodus is er geen beoordelaar. Je inzending blijft op dit apparaat.</p>}
        </>
      )}
    </main>
  );
}
