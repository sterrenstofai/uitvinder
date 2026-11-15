"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app";
import { Cover } from "@/components/Cover";
import { Kaart } from "@/components/Kaart";
import { afgerond, curExp, expTitel, laatste, nul, weekNr } from "@/lib/afgeleid";

const WELKOM_GEZIEN = "uitvinder-welkom-gezien";

export function Vandaag({ zoWerktHet }: { zoWerktHet: string | null }) {
  const { data } = useApp();
  // Het welkom staat er tot je het wegklikt. Daarna vind je het terug op Reis.
  const [welkom, setWelkom] = useState(false);
  useEffect(() => {
    try { setWelkom(!localStorage.getItem(WELKOM_GEZIEN)); } catch {}
  }, []);
  const begrepen = () => {
    try { localStorage.setItem(WELKOM_GEZIEN, "1"); } catch {}
    setWelkom(false);
  };
  const n = nul(data), l = laatste(data), open = curExp(data), wk = Math.min(weekNr(data), 12), af = afgerond(data).length;
  // Zelfde volgorde als het prototype. De metingen en de eindopdracht komen erbij
  // zodra die schermen zijn overgezet (stap 4 van de bouwvolgorde).
  let next: { k: string; h: string; p: string; a: string; b: string };
  if (!data.inv.zin) next = { k: "Fundament, stap 2", h: "Bepaal je invalshoek.", p: "Wat combineer jij dat schaars is? Zonder invalshoek wordt elk experiment een losse gok.", a: "/invalshoek", b: "Naar je invalshoek" };
  else if (open) next = { k: `Week ${wk}, lopende ronde`, h: expTitel(open), p: "Maak de ronde af: bouwen, meten en vastleggen wat je leerde.", a: `/ronde/${open.id}`, b: "Verder met deze ronde" };
  else next = { k: `Week ${wk}`, h: "Start de ronde van deze week.", p: "Zoek een signaal voor het merk van een klant, bouw iets en meet het.", a: "/ronde/nieuw", b: "Start een nieuwe ronde" };
  const uur = new Date().getHours(), groet = uur < 12 ? "Goedemorgen" : uur < 18 ? "Goedemiddag" : "Goedenavond";
  const mine = [...data.exps].reverse().slice(0, 3);
  const naam = data.profile?.naam || "";
  return (
    <main className="wrap wide">
      <section className="dash-h">
        <Cover seed={"dash" + naam} w={1200} h={520} cls="lg" />
        <div className="lbl">Week {wk} van 12</div>
        <h1>{groet}, {naam.split(" ")[0]}.</h1>
        <div className="wkbar" aria-label={`Week ${wk} van 12`}>
          {Array.from({ length: 12 }, (_, i) => <i key={i} className={i + 1 < wk ? "d" : i + 1 === wk ? "n" : ""}></i>)}
        </div>
        <div className="kpi">
          <div><span>Uitvinder nu</span><b>{l ? Math.round(l.pct_uitvindend) : "–"}%</b></div>
          <div><span>Rondes af</span><b>{af}/10</b></div>
          <div><span>Lopend</span><b>{data.exps.length - af}</b></div>
        </div>
      </section>
      {welkom && zoWerktHet && (
        <section className="paneel welkom" aria-label="Zo werkt het">
          <h2>Zo werkt het.</h2>
          <div className="md" dangerouslySetInnerHTML={{ __html: zoWerktHet }} />
          <div className="btns" style={{ marginTop: 16 }}>
            <button className="btn" onClick={begrepen}>Begrepen</button>
            <Link className="btn ghost" href="/studiewijzer">Lees de studiewijzer</Link>
            <span className="hint">Je vindt dit terug op Reis.</span>
          </div>
        </section>
      )}
      <div className="dash">
        <div>
          <section className="next">
            <Cover seed={"next" + (open ? open.id : "x")} w={800} h={360} cls="lg" />
            <span className="k">{next.k}</span>
            <h2>{next.h}</h2>
            <p>{next.p}</p>
            <div className="btns"><Link className="btn" href={next.a}>{next.b}</Link></div>
          </section>
          <div className="grp"><span>Je laatste kaarten</span><Link href="/volgt/library" className="hint">Alles</Link></div>
          {mine.length ? (
            <div style={{ marginTop: 10 }}>{mine.map((e) => <Kaart key={e.id} e={e} eigen />)}</div>
          ) : (
            <div className="empty" style={{ marginTop: 10 }}>Nog geen kaarten. Elke ronde levert er een op.</div>
          )}
        </div>
        <div>
          <div className="grp"><span>Cockpit</span><Link href="/volgt/cockpit" className="hint">Naar de cockpit</Link></div>
          <div className="empty" style={{ marginTop: 10 }}>De cockpit is nog niet overgezet.</div>
          <div className="grp"><span>Deze week in de markt</span><Link href="/volgt/markt" className="hint">Naar de markt</Link></div>
          <div className="empty" style={{ marginTop: 10 }}>De markt is nog niet overgezet.</div>
          {data.profile?.ondernemer && (
            <>
              <div className="grp"><span>Je administratie</span><Link href="/administratie" className="hint">Naar je administratie</Link></div>
              <Link className="row" href="/administratie" style={{ textDecoration: "none" }}>
                <span className="nm">Potjes, factuur en checklist</span>
                <span className="why">{data.adm.stappen_af.length ? `${data.adm.stappen_af.length} onderwerpen geregeld.` : "Zie wat je opzij zet en wat erbij komt kijken."}</span>
              </Link>
            </>
          )}
          <div className="grp"><span>Je verschuiving</span><Link href="/reis" className="hint">Metingen</Link></div>
          <div className="cmp" style={{ marginTop: 10 }}>
            <div><span>Nulmeting</span><b>{n ? Math.round(n.pct_uitvindend) : "–"}%</b><span>uitvinder</span></div>
            <div><span>Laatste meting</span><b>{l ? Math.round(l.pct_uitvindend) : "–"}%</b><span>uitvinder</span></div>
          </div>
          <p className="hint" style={{ marginTop: 10 }}>Je scant opnieuw bij de metingen in week 6 en 12.</p>
        </div>
      </div>
    </main>
  );
}
