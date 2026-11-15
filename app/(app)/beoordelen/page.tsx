"use client";
// Voor de beoordelaar. Je ziet alleen wat een deelnemer zelf heeft ingediend.
import { useEffect, useState } from "react";
import { useApp } from "@/components/app";
import { Cover } from "@/components/Cover";
import { Kaart } from "@/components/Kaart";
import { MetingTabel } from "@/components/MetingTabel";
import { expTitel, fmtD } from "@/lib/afgeleid";
import { cijfers, EINDRUBRIC, getal1, NIVEAUS, RUBRIC } from "@/lib/toetsing";
import type { BeoordelingScores, Inzending } from "@/lib/types";

export default function Beoordelen() {
  const { data, modus, inzendingen, bewaarBeoordeling, herlaad, toast } = useApp();
  const [lijst, setLijst] = useState<Inzending[] | null>(null);
  const [fout, setFout] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [scores, setScores] = useState<BeoordelingScores>({ kaarten: {}, eind: [] });
  const [bezig, setBezig] = useState(false);

  const laad = () => inzendingen().then(setLijst, () => setFout("De inzendingen konden niet geladen worden. Is de tweede migratie uitgevoerd?"));
  useEffect(() => {
    if (data.magBeoordelen) laad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.magBeoordelen]);

  if (!data.magBeoordelen)
    return (
      <main className="wrap">
        <div className="ph"><div className="lbl">Beoordelen</div><h1>Dit scherm is voor beoordelaars.</h1><p>Je bent nog niet aangewezen als beoordelaar.</p></div>
      </main>
    );

  const inz = lijst?.find((x) => x.deelnemer.id === open) ?? null;

  if (!inz)
    return (
      <main className="wrap">
        <div className="ph">
          <div className="lbl">Beoordelen</div>
          <h1>Ingediende portfolio&apos;s.</h1>
          <p>Je ziet alleen wat een deelnemer zelf heeft ingediend: drie kaarten, de metingen en de eindopdracht. De AI beoordeelt niet.</p>
          {modus === "lokaal" && <p className="hint">Voorbeeldmodus: je ziet hier je eigen inzending, om te proberen hoe beoordelen werkt.</p>}
        </div>
        {fout && <p className="err" role="alert">{fout}</p>}
        {lijst === null && !fout && <div className="empty" aria-busy="true">Laden…</div>}
        {lijst?.length === 0 && <div className="empty">Er is nog niets ingediend.</div>}
        {lijst?.map((x) => (
          <button key={x.deelnemer.id} className="row" style={{ width: "100%", textAlign: "left", border: 0, cursor: "pointer", font: "inherit" }}
            onClick={() => { setOpen(x.deelnemer.id); setScores(x.beoordeling?.scores ?? { kaarten: {}, eind: [] }); window.scrollTo(0, 0); }}>
            <span className="nm">{x.deelnemer.naam}</span>
            <span className={`tag ${x.beoordeling?.vastgesteld_op ? "dk" : "ov"}`}>{x.beoordeling?.vastgesteld_op ? `Vastgesteld: ${getal1(x.beoordeling.cijfer ?? 0)}` : x.beoordeling ? "Concept" : "Te beoordelen"}</span>
            <span className="why">{x.deelnemer.rol} · ingediend op {fmtD(x.eind.ingediend_op!)}</span>
          </button>
        ))}
      </main>
    );

  const kaartIds = inz.kaarten.map((k) => k.id);
  const c = cijfers(scores, kaartIds);
  const vast = Boolean(inz.beoordeling?.vastgesteld_op);
  const zetKaart = (id: string, i: number, k: number) =>
    setScores((s) => ({ ...s, kaarten: { ...s.kaarten, [id]: Object.assign([...(s.kaarten[id] ?? [])], { [i]: k }) } }));
  const zetEind = (i: number, k: number) => setScores((s) => ({ ...s, eind: Object.assign([...s.eind], { [i]: k }) }));
  const blok = (namen: string[], waarden: number[], zet: (i: number, k: number) => void) =>
    namen.map((naam, i) => (
      <div key={naam} className="mq">
        <span><b>{naam}</b></span>
        <span className="minis" style={{ flexWrap: "wrap" }} role="group" aria-label={naam}>
          {NIVEAUS.map((l, k) => <button key={l} disabled={vast} aria-pressed={waarden[i] === k} onClick={() => zet(i, k)}>{l}</button>)}
        </span>
      </div>
    ));

  async function bewaar(stelVast: boolean) {
    if (stelVast && !c.compleet) return toast("Scoor eerst alle criteria");
    if (stelVast && !confirm(`Het cijfer ${getal1(c.eind)} vaststellen? De deelnemer ziet het daarna en je kunt het niet meer wijzigen.`)) return;
    setBezig(true);
    try {
      await bewaarBeoordeling(inz!.deelnemer.id, { ...scores, portfolio: c.compleet ? Math.round(c.portfolio * 10) / 10 : undefined, eindopdracht: c.compleet ? Math.round(c.eindopdracht * 10) / 10 : undefined }, c.compleet ? c.eind : 0, stelVast);
      toast(stelVast ? "Vastgesteld" : "Concept bewaard");
      await laad();
      if (stelVast) {
        setOpen(null);
        if (modus === "lokaal") await herlaad();
      }
    } catch {
      toast("Opslaan lukte niet. Probeer het opnieuw.");
    }
    setBezig(false);
  }

  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Beoordelen</div>
        <h1>{inz.deelnemer.naam}</h1>
        <p>Scoor met de rubric uit de studiewijzer. Bij een cijfer tussen 5 en 6, en bij een steekproef van één op de tien, kijkt een tweede beoordelaar mee.</p>
        <div className="btns" style={{ marginTop: 12 }}>
          <button className="btn ghost sm" onClick={() => setOpen(null)}>Terug naar de lijst</button>
          <a className="btn ghost sm" href="/studiewijzer" target="_blank" rel="noopener">Open de rubric</a>
        </div>
      </div>
      <div className="grp"><span>Metingen</span></div>
      <MetingTabel metingen={inz.metingen} />

      {inz.kaarten.map((k, n) => (
        <section key={k.id} className="step">
          <div className="step-h"><b>{n + 1}</b><h2>{expTitel(k)}</h2><span>Kaart {n + 1} van {inz.kaarten.length}</span></div>
          <div className="step-b">
            <Kaart e={k} alleenLezen />
            {blok(RUBRIC, scores.kaarten[k.id] ?? [], (i, niveau) => zetKaart(k.id, i, niveau))}
          </div>
        </section>
      ))}

      <section className="step">
        <div className="step-h"><b>E</b><h2>Eindopdracht, 40%</h2></div>
        <div className="step-b">
          <p>Pitch: {inz.eind.pitch_link ? <a href={inz.eind.pitch_link} target="_blank" rel="noopener noreferrer">{inz.eind.pitch_link}</a> : "geen link"}</p>
          <div className="rolx" style={{ whiteSpace: "pre-wrap", margin: "12px 0" }}><b>Reflectieverslag</b>{inz.eind.reflectie}</div>
          {blok(EINDRUBRIC, scores.eind, zetEind)}
        </div>
      </section>

      <section className="next">
        <Cover seed="cijfer" w={800} h={360} cls="lg" />
        <span className="k">Eindcijfer</span>
        <div className="cijfer">{c.compleet ? getal1(c.eind) : "–"}</div>
        <p>
          {c.compleet
            ? `Portfolio ${getal1(c.portfolio)}, eindopdracht ${getal1(c.eindopdracht)}. ${c.geslaagd ? "Voldoende." : "Onvoldoende. Een herkansing richt zich op het onderdeel dat onder voldoende bleef."}${c.eind >= 5 && c.eind < 6 ? " Tweede beoordelaar nodig." : ""}`
            : "Scoor alle criteria om het cijfer te zien."}
        </p>
        {!vast && (
          <div className="btns">
            <button className="btn" disabled={bezig} onClick={() => bewaar(true)}>Stel vast</button>
            <button className="btn ghost" disabled={bezig} onClick={() => bewaar(false)}>Bewaar als concept</button>
          </div>
        )}
      </section>
    </main>
  );
}
