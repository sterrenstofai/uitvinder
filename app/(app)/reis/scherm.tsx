"use client";
import Link from "next/link";
import { useApp } from "@/components/app";
import { LesBox } from "@/components/Les";
import type { Les } from "@/lib/lessen";
import { afgerond, expTitel, fmtD, laatste, METINGWEKEN, nul, weekNr } from "@/lib/afgeleid";

export function Reis({ zoWerktHet, lesRolscan }: { zoWerktHet: string | null; lesRolscan: Les }) {
  const { data } = useApp();
  const n = nul(data), af = afgerond(data).length, wk = Math.min(weekNr(data), 12), zin = data.inv.zin;
  return (
    <main className="wrap wide">
      <div className="ph">
        <div className="lbl">Reis, week {wk} van 12</div>
        <h1>Van uitvoerder naar uitvinder.</h1>
        <p>Week 1 het fundament, week 2 tot en met 11 tien rondes, week 12 je eindopdracht. Metingen in week 1, 6 en 12.</p>
      </div>
      {zoWerktHet && (
        <details className="les" style={{ marginTop: 20, background: "var(--card)" }}>
          <summary><span>Zo werkt het<small>Twaalf weken, de beoordeling en de metingen</small></span></summary>
          <div className="lb"><div className="md" dangerouslySetInnerHTML={{ __html: zoWerktHet }} /><div className="btns"><Link className="btn ghost sm" href="/studiewijzer">Lees de hele studiewijzer</Link></div></div>
        </details>
      )}
      <div className="weeks">
        {Array.from({ length: 12 }, (_, i) => {
          const w = i + 1;
          const done = w === 1 ? Boolean(n && zin) : w === 12 ? Boolean(data.eind.ingediend_op) : af >= w - 1;
          return (
            <div key={w} className={`wk ${done ? "done" : ""} ${w === wk ? "now" : ""}`}>
              <strong>{w}</strong>
              <span>{w === 1 ? "Basis" : w === 12 ? "Eind" : "Ronde"}</span>
              {METINGWEKEN.includes(w) ? <i title="Meting"></i> : <span style={{ height: 7 }}></span>}
            </div>
          );
        })}
      </div>
      <div className="wkl"><span>Meting</span><span className="nd">{af} van 10 rondes afgerond</span></div>
      <div className="grp"><span>Metingen</span></div>
      <div className="btns" style={{ marginTop: 12 }}>
        {METINGWEKEN.map((w) => {
          const gedaan = data.metingen.some((m) => m.week === w);
          return <Link key={w} className={`btn sm ${gedaan ? "ghost" : ""}`} href={`/meting/${w}`}>{gedaan ? "✓ " : ""}Meting week {w}</Link>;
        })}
      </div>
      <div className="grp"><span>Fundament</span><span>Eenmalig</span></div>
      <section className={`step ${n ? "done" : ""}`}>
        <div className="step-h"><b>{n ? "✓" : "1"}</b><h2>Rolscan</h2><span>{n ? fmtD(n.datum) : ""}</span></div>
        <div className="step-b">
          <LesBox les={lesRolscan} />
          {n ? (
            <>
              <p>
                Nulmeting: <b>{Math.round(n.pct_uitvindend)}% uitvinder</b>.{" "}
                {data.scans.length > 1 && <>Laatste meting: <b>{Math.round(laatste(data).pct_uitvindend)}%</b>.</>}
              </p>
              <div className="btns" style={{ marginTop: 14 }}><Link className="btn ghost sm" href="/rolscan">Scan opnieuw</Link></div>
            </>
          ) : (
            <Link className="btn" href="/rolscan">Doe de Rolscan</Link>
          )}
        </div>
      </section>
      <section className={`step ${zin ? "done" : ""}`}>
        <div className="step-h"><b>{zin ? "✓" : "2"}</b><h2>Jouw invalshoek</h2></div>
        <div className="step-b">
          {zin ? (
            <>
              <p style={{ fontSize: "1.15rem", fontWeight: 600, lineHeight: 1.35 }}>{zin}</p>
              <div className="btns" style={{ marginTop: 14 }}><Link className="btn ghost sm" href="/invalshoek">Aanscherpen</Link></div>
            </>
          ) : (
            <>
              <p>Wat combineer jij dat schaars is?</p>
              <div className="btns" style={{ marginTop: 14 }}><Link className="btn" href="/invalshoek">Bepaal je invalshoek</Link></div>
            </>
          )}
        </div>
      </section>
      <div className="grp"><span>Cyclus</span><span>{data.exps.length} {data.exps.length === 1 ? "ronde" : "rondes"}</span></div>
      {data.exps.length ? (
        data.exps.slice().reverse().map((e) => (
          <Link key={e.id} className="row" href={`/ronde/${e.id}`} style={{ textDecoration: "none" }}>
            <span className="nm">{expTitel(e)}</span>
            <span className={`tag ${e.status === "af" ? "dk" : "ov"}`}>{e.status === "af" ? "Afgerond" : "Bezig"}</span>
            <span className="why">{e.klant || "Geen klant"} · {fmtD(e.datum)}</span>
          </Link>
        ))
      ) : (
        <div className="empty" style={{ marginTop: 14 }}>Nog geen rondes.</div>
      )}
      <div className="btns" style={{ marginTop: 20 }}><Link className="btn" href="/ronde/nieuw">Start een nieuwe ronde</Link></div>
    </main>
  );
}
