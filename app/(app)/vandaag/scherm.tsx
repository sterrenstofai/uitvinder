"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app";
import { markt, voorMij } from "@/lib/markt";
import { Cover } from "@/components/Cover";
import { Kaart } from "@/components/Kaart";
import { afgerond, curExp, expTitel, laatste, METINGWEKEN, nul, weekNr } from "@/lib/afgeleid";

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
  // Zelfde volgorde als het prototype.
  let next: { k: string; h: string; p: string; a: string; b: string };
  const weekNu = weekNr(data);
  const mNodig = METINGWEKEN.filter((w) => w <= weekNu && !data.metingen.some((m) => m.week === w));
  if (!n) next = { k: "Fundament, stap 1", h: "Doe de Rolscan.", p: "Beschrijf je werkweek en zie hoeveel van je werk uitvoerend is. Dat is je nulmeting.", a: "/rolscan", b: "Naar de Rolscan" };
  else if (mNodig.length) next = { k: `Week ${wk}`, h: `Doe je ${mNodig[0] === 1 ? "start" : mNodig[0] === 6 ? "tussen" : "eind"}meting.`, p: "Twaalf uitspraken en een nieuwe Rolscan. Zo zie je straks hoe je verschoven bent.", a: `/meting/${mNodig[0]}`, b: "Naar de meting" };
  else if (data.beoordeling && data.beoordeling.cijfer !== null && data.beoordeling.cijfer >= 5.5) next = { k: "Afgerond", h: "Je bent geslaagd.", p: "Je certificaat staat klaar.", a: "/certificaat", b: "Bekijk je certificaat" };
  else if (weekNu >= 12 && !data.eind.ingediend_op) next = { k: "Week 12", h: "Je eindopdracht.", p: "Kies je drie sterkste kaarten, maak je pitch en schrijf je reflectie.", a: "/portfolio", b: "Naar je portfolio" };
  else if (!data.inv.zin) next = { k: "Fundament, stap 2", h: "Bepaal je invalshoek.", p: "Wat combineer jij dat schaars is? Zonder invalshoek wordt elk experiment een losse gok.", a: "/invalshoek", b: "Naar je invalshoek" };
  else if (open) next = { k: `Week ${wk}, lopende ronde`, h: expTitel(open), p: "Maak de ronde af: bouwen, meten en vastleggen wat je leerde.", a: `/ronde/${open.id}`, b: "Verder met deze ronde" };
  else next = { k: `Week ${wk}`, h: "Start de ronde van deze week.", p: "Zoek een signaal voor het merk van een klant, bouw iets en meet het.", a: "/ronde/nieuw", b: "Start een nieuwe ronde" };
  const uur = new Date().getHours(), groet = uur < 12 ? "Goedemorgen" : uur < 18 ? "Goedemiddag" : "Goedenavond";
  const mine = [...data.exps].reverse().slice(0, 3);
  const naam = data.profile?.naam || "";
  const wacht = data.taken.filter((t) => t.status === "klaar").length;
  const mk = markt(data), tr = voorMij(mk.trends, data.watch);
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
          <div><span>Trends voor jou</span><b>{tr.length}</b></div>
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
          <div className="grp"><span>Je laatste kaarten</span><Link href="/library" className="hint">Alles</Link></div>
          {mine.length ? (
            <div style={{ marginTop: 10 }}>{mine.map((e) => <Kaart key={e.id} e={e} eigen />)}</div>
          ) : (
            <div className="empty" style={{ marginTop: 10 }}>Nog geen kaarten. Elke ronde levert er een op.</div>
          )}
        </div>
        <div>
          <div className="grp"><span>Cockpit</span><Link href="/cockpit" className="hint">Naar de cockpit</Link></div>
          <Link className="row" href="/cockpit" style={{ textDecoration: "none" }}>
            {data.klanten.length ? (
              <>
                <span className="nm">{wacht} {wacht === 1 ? "ding wacht" : "dingen wachten"} op je akkoord</span>
                <span className="tag ui">{wacht}</span>
                <span className="why">De agents zetten klaar, jij keurt.</span>
              </>
            ) : (
              <>
                <span className="nm">Nog geen klanten</span>
                <span className="why">Voeg een klant toe of oefen met voorbeelden.</span>
              </>
            )}
          </Link>
          <div className="grp"><span>Deze week in de markt</span><Link href="/markt" className="hint">Naar de markt</Link></div>
          {tr.slice(0, 3).map((t) => {
            const m = mk.zetten.find((x) => x.trend_id === t.id);
            return (
              <div key={t.id} className="tmini">
                <span className="mom" style={{ justifySelf: "start" }}>{t.momentum}</span>
                <b>{t.titel}</b>
                {m && <span className="hint">Thijs deed hier iets mee: {m.titel}</span>}
              </div>
            );
          })}
          {!tr.length && <div className="empty" style={{ marginTop: 10 }}>Geen trends voor jouw sectoren.</div>}
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
