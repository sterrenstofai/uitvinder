"use client";
// Cockpit: jij stuurt, de agents voeren uit. Geen besluit zonder reden.
import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app";
import { Cover } from "@/components/Cover";
import { AGENTS, SECTOREN, TOOLNAMEN, uur, VOORBEELDNAMEN } from "@/lib/cockpit";
import type { Taak } from "@/lib/types";

export default function Cockpit() {
  const { data, laadVoorbeeldklanten, verwijderVoorbeeldklanten, nieuweKlant, besluitTaak, zetKoppeling, toast } = useApp();
  const [K, setK] = useState("alle");
  const [kies, setKies] = useState<Record<string, number>>({});
  const [tekst, setTekst] = useState<Record<string, string>>({});
  const [bezig, setBezig] = useState(false);
  const [nieuw, setNieuw] = useState<{ naam: string; sector: string; merk: string; doelgroep: string; kanalen: string } | null>(null);

  const klanten = data.klanten;
  const heeftVoorbeeld = klanten.some((k) => VOORBEELDNAMEN.includes(k.naam));
  const naam = (id: string) => klanten.find((k) => k.id === id)?.naam || "Onbekend";
  const inK = (t: Taak) => K === "alle" || t.klant_id === K;
  const taken = data.taken.filter(inK), klaar = taken.filter((t) => t.status === "klaar"), lopend = taken.filter((t) => t.status === "bezig");
  const uren = taken.filter((t) => t.status === "goedgekeurd").reduce((a, t) => a + (t.uren ?? 0), 0);
  const actief = (klantId: string, tool: string) => data.koppelingen.some((x) => x.klant_id === klantId && x.tool === tool && x.status === "actief");
  const aantalKop = data.koppelingen.filter((x) => x.status === "actief" && (K === "alle" || x.klant_id === K)).length;

  async function doe(f: () => Promise<unknown>, ok?: string) {
    setBezig(true);
    try {
      await f();
      if (ok) toast(ok);
    } catch {
      toast("Dat lukte niet. Probeer het opnieuw.");
    }
    setBezig(false);
  }
  function besluit(t: Taak, soort: "goed" | "bij" | "stop") {
    const r = (tekst[t.id] || "").trim();
    if (soort === "goed" && t.opties.length && kies[t.id] === undefined) return toast("Kies eerst een optie");
    if (!r) return toast(soort === "goed" ? "Schrijf op waarom je dit kiest" : soort === "bij" ? "Schrijf op wat de agent anders moet doen" : "Schrijf op waarom je stopt");
    doe(async () => {
      await besluitTaak(t, soort, r, kies[t.id]);
      setTekst((x) => ({ ...x, [t.id]: "" }));
    }, soort === "goed" ? "Goedgekeurd. Er staat een experimentkaart in je reis" : soort === "bij" ? "Teruggestuurd naar de agent" : "Gestopt");
  }
  async function bewaarKlant(e: React.FormEvent) {
    e.preventDefault();
    if (!nieuw?.naam.trim()) return;
    await doe(async () => {
      const k = await nieuweKlant({ naam: nieuw.naam.trim(), sector: nieuw.sector || null, merk: nieuw.merk.trim() || null, doelgroep: nieuw.doelgroep.trim() || null, kanalen: nieuw.kanalen.split(",").map((x) => x.trim()).filter(Boolean) });
      setNieuw(null);
      setK(k.id);
    }, "Klant toegevoegd");
  }

  return (
    <main className="wrap wide">
      <section className="ck-h">
        <Cover seed="cockpit-9" w={1200} h={520} cls="lg" />
        <div className="lbl" style={{ color: "rgba(255,255,255,.7)" }}>Cockpit</div>
        <h1>Jij stuurt. De agents voeren uit.</h1>
        <p>Alles wat de agents klaarzetten in Figma, Canva, Meta en de rest, op één plek. Niets gaat naar buiten zonder jouw akkoord, en elke keuze wordt een experimentkaart.</p>
        <div className="kpi">
          <div><span>Klaar voor jou</span><b>{klaar.length}</b></div>
          <div><span>Agents bezig</span><b>{lopend.length}</b></div>
          <div><span>Uren terug</span><b>{uur(uren)}</b></div>
          <div><span>Koppelingen</span><b>{aantalKop}</b></div>
        </div>
      </section>

      <p className="hint" style={{ marginTop: 14 }}>
        De agents zijn nog nagebootst: er werkt nog niets echt in Figma, Canva of Meta. Met de voorbeeldklanten oefen je de werkwijze. Je eigen klanten kun je al toevoegen; hun dossier en hun experimenten zijn echt.
      </p>

      {klanten.length === 0 ? (
        <section className="next" style={{ marginTop: 16 }}>
          <Cover seed="cockpit-leeg" w={800} h={360} cls="lg" />
          <span className="k">Nog geen klanten</span>
          <h2>Begin met je eigen klant of oefen met voorbeelden.</h2>
          <p>De voorbeeldklanten komen met taken die agents hebben klaargezet. Je kunt ze later weer verwijderen.</p>
          <div className="btns">
            <button className="btn" disabled={bezig} onClick={() => doe(laadVoorbeeldklanten, "Voorbeeldklanten geladen")}>Laad de voorbeeldklanten</button>
            <button className="btn ghost" onClick={() => setNieuw({ naam: "", sector: "", merk: "", doelgroep: "", kanalen: "" })}>Voeg een eigen klant toe</button>
          </div>
        </section>
      ) : (
        <>
          <div className="seg" style={{ marginTop: 20 }}>
            {[["alle", "Alle klanten"], ...klanten.map((k) => [k.id, k.naam])].map(([id, n]) => <button key={id} aria-pressed={K === id} onClick={() => setK(id)}>{n}</button>)}
          </div>
          <div className="btns" style={{ marginTop: 12 }}>
            {K !== "alle" && <Link className="btn ghost sm" href={`/klant/${K}`}>Open het klantdossier</Link>}
            <button className="btn ghost sm" onClick={() => setNieuw({ naam: "", sector: "", merk: "", doelgroep: "", kanalen: "" })}>Voeg een klant toe</button>
            {!heeftVoorbeeld && <button className="btn ghost sm" disabled={bezig} onClick={() => doe(laadVoorbeeldklanten, "Voorbeeldklanten geladen")}>Laad de voorbeeldklanten</button>}
            {heeftVoorbeeld && <button className="btn ghost sm" disabled={bezig} onClick={() => { if (confirm("De drie voorbeeldklanten en hun taken verwijderen? Kaarten die je al goedkeurde blijven staan.")) { setK("alle"); doe(verwijderVoorbeeldklanten, "Voorbeeldklanten verwijderd"); } }}>Verwijder de voorbeeldklanten</button>}
          </div>
        </>
      )}

      {nieuw && (
        <form className="paneel" onSubmit={bewaarKlant}>
          <label className="f" style={{ marginTop: 0 }}><span>Naam van de klant</span><input type="text" required value={nieuw.naam} onChange={(e) => setNieuw({ ...nieuw, naam: e.target.value })} /></label>
          <label className="f"><span>Sector</span><select value={nieuw.sector} onChange={(e) => setNieuw({ ...nieuw, sector: e.target.value })}><option value="">Kies een sector</option>{SECTOREN.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="f"><span>Het merk in één zin</span><input type="text" value={nieuw.merk} onChange={(e) => setNieuw({ ...nieuw, merk: e.target.value })} placeholder="Wat het maakt of doet, en waar het om bekendstaat" /></label>
          <label className="f"><span>Doelgroep</span><input type="text" value={nieuw.doelgroep} onChange={(e) => setNieuw({ ...nieuw, doelgroep: e.target.value })} /></label>
          <label className="f"><span>Kanalen</span><small>Gescheiden door komma&apos;s.</small><input type="text" value={nieuw.kanalen} onChange={(e) => setNieuw({ ...nieuw, kanalen: e.target.value })} placeholder="Instagram, website, nieuwsbrief" /></label>
          <div className="btns" style={{ marginTop: 16 }}><button className="btn" disabled={bezig}>Bewaar klant</button><button type="button" className="btn ghost" onClick={() => setNieuw(null)}>Annuleer</button></div>
        </form>
      )}

      {klanten.length > 0 && (
        <div className="ck">
          <div>
            <div className="grp"><span>Klaar voor jou</span><span>{klaar.length}</span></div>
            {klaar.length ? klaar.map((t) => (
              <article key={t.id} className="ap">
                <div className="meta-l">
                  <Link className="tag" href={`/klant/${t.klant_id}`} style={{ textDecoration: "none" }}>{naam(t.klant_id)}</Link>
                  <span className="tag ui">{t.agent}</span><span className="tag ov">{t.tool}</span>
                  <span className="hint">{uur(t.uren ?? 0)} uur uitvoering</span>
                </div>
                <h3>{t.titel}</h3>
                <p className="why">{t.aanleiding}</p>
                {t.opties.length > 0 && (
                  <div className="opt" role="radiogroup" aria-label="Opties van de agent">
                    {t.opties.map((o, i) => (
                      <label key={o}><input type="radio" name={`o-${t.id}`} checked={kies[t.id] === i} onChange={() => setKies({ ...kies, [t.id]: i })} /><span>{o}</span></label>
                    ))}
                  </div>
                )}
                <label className="f" style={{ margin: 0 }}>
                  <span>Je reden of instructie</span>
                  <textarea style={{ minHeight: 70 }} value={tekst[t.id] || ""} onChange={(e) => setTekst({ ...tekst, [t.id]: e.target.value })} placeholder="Waarom deze keuze, of wat moet de agent anders doen?" />
                </label>
                <div className="btns">
                  <button className="btn sm" disabled={bezig} onClick={() => besluit(t, "goed")}>Goedkeuren</button>
                  <button className="btn ghost sm" disabled={bezig} onClick={() => besluit(t, "bij")}>Bijsturen</button>
                  <button className="btn stop sm" disabled={bezig} onClick={() => besluit(t, "stop")}>Stoppen</button>
                </div>
                {t.historie.length > 0 && <div className="hist">{t.historie.map((h, i) => <span key={i}>{h}</span>)}</div>}
              </article>
            )) : <div className="empty" style={{ marginTop: 12 }}>Niets wacht op je. Tijd voor een signaal of een klantgesprek.</div>}
            {uren > 0 && (
              <div className="tmini" style={{ marginTop: 16 }}>
                <b>{uur(uren)} uur uitvoering terug.</b>
                <span className="hint">Besteed die aan wat geen agent kan: een signaal zoeken, een experiment bedenken, met de klant praten.</span>
                <div className="btns"><Link className="btn sm" href="/ronde/nieuw">Start een ronde</Link></div>
              </div>
            )}
          </div>
          <aside>
            <div className="grp"><span>Wat de agents doen</span></div>
            <div className="agents">
              {AGENTS.map(([a, c]) => {
                const t = taken.filter((x) => x.agent === a), b = t.filter((x) => x.status === "bezig").length, k = t.filter((x) => x.status === "klaar").length;
                return (
                  <div key={a} className="ag">
                    <span className="dot" style={{ background: c }}></span><b>{a}</b>
                    <span className="hint">{b ? `${b} bezig` : ""}{b && k ? ", " : ""}{k ? `${k} klaar` : ""}{!b && !k ? "rustig" : ""}</span>
                    <small>{t[0] ? t[0].titel : "Geen werk voor deze selectie"}</small>
                  </div>
                );
              })}
            </div>
            <div className="grp"><span>Koppelingen</span><span>{K === "alle" ? "Kies een klant" : naam(K)}</span></div>
            {K === "alle" ? <p className="hint" style={{ marginTop: 10 }}>Kies hierboven een klant om zijn koppelingen te zien.</p> : (
              <>
                <div className="kop">
                  {TOOLNAMEN.map((n) => {
                    const on = actief(K, n);
                    return <div key={n}><span>{n}</span><button className={`tag ${on ? "on" : "off"}`} style={{ border: 0, cursor: "pointer" }} disabled={bezig} onClick={() => doe(() => zetKoppeling(K, n, !on), on ? `${n} ontkoppeld` : `${n} gekoppeld (nagebootst)`)}>{on ? "Gekoppeld" : "Koppel"}</button></div>;
                  })}
                </div>
                <p className="hint" style={{ marginTop: 8 }}>Nagebootst: er wordt nog niets echt gekoppeld. De eerste echte koppeling wordt Figma.</p>
              </>
            )}
            <div className="grp"><span>Eerder besloten</span></div>
            {taken.filter((t) => t.status === "goedgekeurd" || t.status === "gestopt").map((t) => (
              <div key={t.id} className="tmini">
                <span className={`tag ${t.status === "goedgekeurd" ? "on" : "off"}`} style={{ justifySelf: "start" }}>{t.status === "goedgekeurd" ? "Goedgekeurd" : "Gestopt"}</span>
                <b>{t.titel}</b><span className="hint">{t.besluit}</span>
              </div>
            ))}
            {!taken.some((t) => t.status === "goedgekeurd" || t.status === "gestopt") && <p className="hint" style={{ marginTop: 10 }}>Nog niets besloten.</p>}
          </aside>
        </div>
      )}
    </main>
  );
}
