"use client";
// Markt: wat er speelt, en wat Thijs ermee doet. Jij beslist of het een signaal is.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app";
import { weekNr } from "@/lib/afgeleid";
import { SECTOREN } from "@/lib/cockpit";
import { markt, voorMij, ZETNAAM } from "@/lib/markt";
import type { Trend, Zet } from "@/lib/types";

const LEEG_T = { titel: "", bron: "", momentum: "Nieuw", sectoren: [] as string[], uitleg: "", wat_je_kunt_doen: "" };
const LEEG_Z = { type: "gestart", titel: "", wat: "", waarom: "", uitkomst: "", link: "", trend_id: "" };

export default function Markt() {
  const { data, setWatch, nieuwExp, nieuweTrend, verwijderTrend, nieuweZet, verwijderZet, toast } = useApp();
  const router = useRouter();
  const W = data.watch;
  const { voorbeeld, trends, zetten } = markt(data);
  const lijst = voorMij(trends, W);
  const [nt, setNt] = useState<typeof LEEG_T | null>(null);
  const [nz, setNz] = useState<typeof LEEG_Z | null>(null);

  const wissel = (x: string) => setWatch(W.includes(x) ? W.filter((y) => y !== x) : [...W, x]).catch(() => toast("Opslaan lukte niet."));
  async function signaal(t: Trend) {
    try {
      const e = await nieuwExp({ signaal: `${t.titel}. ${t.uitleg}`, titel: "" });
      toast("Signaal in een nieuwe ronde gezet");
      router.push(`/ronde/${e.id}`);
    } catch { toast("Dat lukte niet."); }
  }
  async function remix(m: Zet) {
    const t = trends.find((x) => x.id === m.trend_id);
    try {
      const e = await nieuwExp({ signaal: t ? `${t.titel}. ${t.uitleg}` : "", bouw: m.wat, remix_titel: m.titel, remix_auteur: "Thijs Mensink" });
      toast("Remix gestart");
      router.push(`/ronde/${e.id}`);
    } catch { toast("Dat lukte niet."); }
  }
  const toets = (t: Trend) => {
    const nu = /Piek|Nieuw|Stijgend/.test(t.momentum || ""), recht = !W.length ? null : t.sectoren.some((x) => W.includes(x));
    return (
      <div className="toets3">
        <div className={nu ? "ja" : "tw"}><b>{nu ? "Van nu" : "Twijfel"}</b>{nu ? "Speelt deze weken" : "Is het van nu, of altijd waar?"}</div>
        <div className={recht === false ? "tw" : recht ? "ja" : ""}><b>{recht === null ? "Kies je sector" : recht ? "Past bij je sector" : "Twijfel"}</b>{recht === null ? "Om te zien of je merk er iets over mag zeggen" : "Heeft jouw klant er recht van spreken?"}</div>
        <div className="ja"><b>Iets doen</b>{t.wat_je_kunt_doen}</div>
      </div>
    );
  };

  return (
    <main className="wrap wide">
      <div className="ph">
        <div className="lbl">Markt, week {Math.min(weekNr(data), 12)}</div>
        <h1>Wat er speelt, en wat ik ermee doe.</h1>
        <p>Links de trends van deze weken, gefilterd op de sectoren die jij volgt. Rechts wat ik er zelf mee bouw, met mijn reden erbij. Jij beslist of het voor jouw klant een signaal is.</p>
      </div>
      <div className="grp"><span>Jouw watchlist</span><span>{W.length ? `${W.length} gevolgd` : "Alles"}</span></div>
      <div className="seg" style={{ marginTop: 12 }}>{SECTOREN.map((x) => <button key={x} aria-pressed={W.includes(x)} onClick={() => wissel(x)}>{x}</button>)}</div>

      <div className="mkt">
        <div>
          {lijst.length ? lijst.map((t) => {
            const m = zetten.find((x) => x.trend_id === t.id);
            return (
              <article key={t.id} className="trend">
                <div className="meta-l">
                  <span className="mom">{t.momentum}</span>{t.bron && <span className="tag ov">{t.bron}</span>}
                  {t.sectoren.length < SECTOREN.length ? t.sectoren.map((x) => <span key={x} className={`tag ${W.includes(x) ? "ui" : ""}`}>{x}</span>) : <span className="tag">Alle sectoren</span>}
                </div>
                <h3>{t.titel}</h3>
                <p>{t.uitleg}</p>
                <span className="hint">Eerste inschatting met de drievragentoets. Jij beslist.</span>
                {toets(t)}
                {m && <div className="link-thijs"><span className="av-s">TM</span><span>Ik deed hier iets mee: <b>{m.titel}</b></span></div>}
                <div className="btns">
                  <button className="btn sm" onClick={() => signaal(t)}>Maak er een signaal van</button>
                  {m && <button className="btn ghost sm" onClick={() => remix(m)}>Remix mijn zet</button>}
                  {data.isBeheer && !voorbeeld && <button className="btn ghost sm" onClick={() => { if (confirm("Deze trend verwijderen?")) verwijderTrend(t.id).catch(() => toast("Dat lukte niet.")); }}>Verwijder</button>}
                </div>
              </article>
            );
          }) : <div className="empty">Geen trends voor deze sectoren. Volg er meer, of kijk volgende week.</div>}
          <p className="hint">
            {voorbeeld
              ? "Voorbeeldtrends uit de kalender van november 2026. Een dagelijkse scan van nieuws, KNMI, CBS en de kalender is nog niet gebouwd; tot die tijd zet Thijs de trends er zelf in."
              : "Trends geplaatst door Thijs. Een dagelijkse scan van nieuws, KNMI, CBS en de kalender is nog niet gebouwd."}
          </p>
        </div>
        <aside className="side">
          <div className="grp" style={{ margin: 0 }}><span>Mijn zetten</span><span>Thijs Mensink</span></div>
          {zetten.map((m) => (
            <div key={m.id} className="mv">
              <span className={`tag tp ${m.type === "gestart" ? "go" : m.type === "doorgebouwd" ? "up" : "st"}`}>{ZETNAAM[m.type] || m.type}</span>
              <b>{m.titel}</b>
              <p>{m.wat}</p>
              <p><span style={{ color: "var(--ink)", fontWeight: 600 }}>Waarom:</span> {m.waarom}</p>
              <p className="hint">Uitkomst: {m.uitkomst || "volgt"}</p>
              <div className="btns">
                {m.link && <a className="btn ghost sm" href={m.link} target="_blank" rel="noopener noreferrer">Bekijk</a>}
                <button className="btn sm" onClick={() => remix(m)}>Remix</button>
                {data.isBeheer && data.zetten.some((z) => z.id === m.id) && <button className="btn ghost sm" onClick={() => { if (confirm("Deze zet verwijderen?")) verwijderZet(m.id).catch(() => toast("Dat lukte niet.")); }}>Verwijder</button>}
              </div>
            </div>
          ))}
          {!zetten.length && <p className="hint">Nog geen zetten.</p>}
          <p className="hint">Wat ik bouw, waarom, en wat het opleverde, ook als het tegenvalt. Zo leer je van hoe een uitvinder kiest.</p>
        </aside>
      </div>

      {data.isBeheer && (
        <section className="paneel" style={{ marginTop: 28 }}>
          <div className="grp" style={{ margin: 0 }}><span>Beheer</span><span>Alleen zichtbaar voor Thijs</span></div>
          <p className="hint" style={{ marginTop: 8 }}>Zodra je één eigen trend plaatst, verdwijnen de voorbeeldtrends voor iedereen.</p>
          <div className="btns" style={{ marginTop: 12 }}>
            <button className="btn sm" onClick={() => { setNt(nt ? null : { ...LEEG_T }); setNz(null); }}>Nieuwe trend</button>
            <button className="btn ghost sm" onClick={() => { setNz(nz ? null : { ...LEEG_Z }); setNt(null); }}>Nieuwe zet</button>
          </div>
          {nt && (
            <form onSubmit={(e) => { e.preventDefault(); if (!nt.titel.trim()) return; nieuweTrend({ ...nt, titel: nt.titel.trim() }).then(() => { setNt(null); toast("Trend geplaatst"); }, () => toast("Plaatsen lukte niet.")); }}>
              <label className="f"><span>Titel</span><input type="text" required value={nt.titel} onChange={(e) => setNt({ ...nt, titel: e.target.value })} /></label>
              <label className="f"><span>Bron</span><input type="text" value={nt.bron} onChange={(e) => setNt({ ...nt, bron: e.target.value })} placeholder="Nieuws, kalender, KNMI, CBS" /></label>
              <div className="f"><span>Momentum</span><div className="seg">{["Nieuw", "Stijgend", "Piek nu", "Blijvend"].map((x) => <button type="button" key={x} aria-pressed={nt.momentum === x} onClick={() => setNt({ ...nt, momentum: x })}>{x}</button>)}</div></div>
              <div className="f"><span>Sectoren</span><div className="seg">{SECTOREN.map((x) => <button type="button" key={x} aria-pressed={nt.sectoren.includes(x)} onClick={() => setNt({ ...nt, sectoren: nt.sectoren.includes(x) ? nt.sectoren.filter((y) => y !== x) : [...nt.sectoren, x] })}>{x}</button>)}</div></div>
              <label className="f"><span>Uitleg</span><textarea value={nt.uitleg} onChange={(e) => setNt({ ...nt, uitleg: e.target.value })} /></label>
              <label className="f"><span>Wat je kunt doen</span><input type="text" value={nt.wat_je_kunt_doen} onChange={(e) => setNt({ ...nt, wat_je_kunt_doen: e.target.value })} /></label>
              <div className="btns" style={{ marginTop: 14 }}><button className="btn">Plaats trend</button></div>
            </form>
          )}
          {nz && (
            <form onSubmit={(e) => { e.preventDefault(); if (!nz.titel.trim()) return; nieuweZet({ ...nz, titel: nz.titel.trim(), trend_id: nz.trend_id || null }).then(() => { setNz(null); toast("Zet geplaatst"); }, () => toast("Plaatsen lukte niet.")); }}>
              <div className="f"><span>Soort</span><div className="seg">{Object.entries(ZETNAAM).map(([k, n]) => <button type="button" key={k} aria-pressed={nz.type === k} onClick={() => setNz({ ...nz, type: k })}>{n}</button>)}</div></div>
              <label className="f"><span>Titel</span><input type="text" required value={nz.titel} onChange={(e) => setNz({ ...nz, titel: e.target.value })} /></label>
              <label className="f"><span>Wat</span><textarea value={nz.wat} onChange={(e) => setNz({ ...nz, wat: e.target.value })} /></label>
              <label className="f"><span>Waarom</span><textarea value={nz.waarom} onChange={(e) => setNz({ ...nz, waarom: e.target.value })} /></label>
              <label className="f"><span>Uitkomst</span><input type="text" value={nz.uitkomst} onChange={(e) => setNz({ ...nz, uitkomst: e.target.value })} placeholder="Leeg laten als hij nog loopt" /></label>
              <label className="f"><span>Link</span><input type="url" value={nz.link} onChange={(e) => setNz({ ...nz, link: e.target.value })} placeholder="https://" /></label>
              {data.trends.length > 0 && (
                <label className="f"><span>Hoort bij trend</span><select value={nz.trend_id} onChange={(e) => setNz({ ...nz, trend_id: e.target.value })}><option value="">Geen</option>{data.trends.map((t) => <option key={t.id} value={t.id}>{t.titel}</option>)}</select></label>
              )}
              <div className="btns" style={{ marginTop: 14 }}><button className="btn">Plaats zet</button></div>
            </form>
          )}
        </section>
      )}
    </main>
  );
}
