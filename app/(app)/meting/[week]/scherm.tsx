"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app";
import { Cover } from "@/components/Cover";
import { MetingTabel } from "@/components/MetingTabel";
import { fmtD, vandaagISO } from "@/lib/afgeleid";
import { MEET, type MeetDim } from "@/lib/toetsing";

export function MetingScherm({ week }: { week: number }) {
  const { data, bewaarMeting, verwijderMeting, toast } = useApp();
  const router = useRouter();
  const [ant, setAnt] = useState<Record<string, number>>({});
  const [bezig, setBezig] = useState(false);
  const klaar = data.metingen.find((m) => m.week === week);
  const dims = Object.keys(MEET) as MeetDim[];

  async function slaOp() {
    const scores = {} as Record<MeetDim, number>;
    for (const k of dims) {
      const v = [0, 1, 2].map((i) => ant[k + i]);
      if (v.some((x) => !x)) return toast("Beantwoord alle twaalf uitspraken");
      scores[k] = Math.round(((v[0] + v[1] + v[2]) / 3) * 100) / 100;
    }
    setBezig(true);
    try {
      await bewaarMeting({ week, scores, pct_rolscan: null, datum: vandaagISO() });
      toast("Meting opgeslagen. Doe nu de Rolscan.");
      router.push("/rolscan");
    } catch {
      toast("Opslaan lukte niet. Probeer het opnieuw.");
      setBezig(false);
    }
  }

  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Meting, week {week}</div>
        <h1>{week === 1 ? "Je startmeting." : week === 6 ? "Je tussenmeting." : "Je eindmeting."}</h1>
        <p>Twaalf uitspraken over hoe je nu werkt. Er is geen goed of fout antwoord: deze meting laat straks zien hoe je verschoven bent. Daarna doe je de Rolscan opnieuw.</p>
        <p className="hint">Voorlopige vragen in eigen woorden, op de dimensies van innovatief werkgedrag (Janssen, 2000) en creatieve self-efficacy (Tierney &amp; Farmer, 2002). Ze worden vervangen door de gevalideerde vragenlijsten zodra vertaling en rechten geregeld zijn.</p>
      </div>
      {klaar ? (
        <section className="next">
          <Cover seed={"meting" + week} w={800} h={360} cls="lg" />
          <span className="k">Ingevuld op {fmtD(klaar.datum)}</span>
          <h2>Deze meting is klaar.</h2>
          <div className="btns">
            <Link className="btn" href={klaar.pct_rolscan === null ? "/rolscan" : "/vandaag"}>{klaar.pct_rolscan === null ? "Doe de Rolscan erbij" : "Naar vandaag"}</Link>
            <button className="btn ghost" onClick={() => verwijderMeting(week).catch(() => toast("Dat lukte niet."))}>Opnieuw invullen</button>
          </div>
        </section>
      ) : (
        <>
          {dims.map((k, di) => (
            <section key={k} className="step">
              <div className="step-h"><b>{di + 1}</b><h2>{MEET[k].n}</h2><span>1 = nooit of helemaal niet, 5 = altijd of helemaal</span></div>
              <div className="step-b">
                {MEET[k].q.map((q, i) => (
                  <div key={q} className="mq">
                    <span>{q}</span>
                    <span className="sc" role="group" aria-label={q}>
                      {[1, 2, 3, 4, 5].map((v) => <button key={v} aria-pressed={ant[k + i] === v} onClick={() => setAnt({ ...ant, [k + i]: v })}>{v}</button>)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
          <div className="btns" style={{ marginTop: 22 }}>
            <button className="btn" onClick={slaOp} disabled={bezig}>{bezig ? "Bezig…" : "Sla meting op en doe de Rolscan"}</button>
          </div>
        </>
      )}
      <div className="grp"><span>Je metingen</span></div>
      <MetingTabel metingen={data.metingen} />
    </main>
  );
}
