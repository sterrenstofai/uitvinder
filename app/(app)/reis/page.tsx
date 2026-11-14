"use client";
import Link from "next/link";
import { useApp } from "@/components/app";
import { afgerond, expTitel, fmtD, laatste, METINGWEKEN, nul, weekNr } from "@/lib/afgeleid";

export default function Reis() {
  const { data } = useApp();
  const n = nul(data), af = afgerond(data).length, wk = Math.min(weekNr(data), 12), zin = data.inv.zin;
  return (
    <main className="wrap wide">
      <div className="ph">
        <div className="lbl">Reis, week {wk} van 12</div>
        <h1>Van uitvoerder naar uitvinder.</h1>
        <p>Week 1 het fundament, week 2 tot en met 11 tien rondes, week 12 je eindopdracht. Metingen in week 1, 6 en 12.</p>
      </div>
      <div className="weeks">
        {Array.from({ length: 12 }, (_, i) => {
          const w = i + 1;
          // Week 12 (eindopdracht) telt mee zodra dat scherm is overgezet.
          const done = w === 1 ? Boolean(n && zin) : w === 12 ? false : af >= w - 1;
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
        {METINGWEKEN.map((w) => <Link key={w} className="btn sm" href="/volgt/metingen">Meting week {w}</Link>)}
      </div>
      <div className="grp"><span>Fundament</span><span>Eenmalig</span></div>
      <section className={`step ${n ? "done" : ""}`}>
        <div className="step-h"><b>{n ? "✓" : "1"}</b><h2>Rolscan</h2><span>{n ? fmtD(n.datum) : ""}</span></div>
        <div className="step-b">
          {n ? (
            <>
              <p>
                Nulmeting: <b>{Math.round(n.pct_uitvindend)}% uitvinder</b>.{" "}
                {data.scans.length > 1 && <>Laatste meting: <b>{Math.round(laatste(data).pct_uitvindend)}%</b>.</>}
              </p>
              <div className="btns" style={{ marginTop: 14 }}><Link className="btn ghost sm" href="/volgt/rolscan">Scan opnieuw</Link></div>
            </>
          ) : (
            <Link className="btn" href="/volgt/rolscan">Doe de Rolscan</Link>
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
