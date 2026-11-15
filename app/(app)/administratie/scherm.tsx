"use client";
// Ontzorging voor ondernemers: potjes, factuur en een checklist van wat erbij komt kijken.
// Een dienst naast de reis: geen les, geen toetsing. De tool rekent en zet klaar,
// de ondernemer kiest de percentages en verstuurt zelf. Niets gaat vanzelf de deur uit.
import { useState } from "react";
import { useApp } from "@/components/app";
import type { AdmInhoud } from "@/lib/lessen";
import type { Bedrijf } from "@/lib/types";

const euro = (n: number) => n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
const getal = (s: string) => {
  const n = parseFloat(String(s).replace(/[€\s]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
const TARIEVEN = [21, 9, 0];
const TABS = [["potjes", "Potjes"], ["factuur", "Factuur"], ["checklist", "Checklist"]] as const;
type Tab = (typeof TABS)[number][0];
type Regel = { wat: string; aantal: string; prijs: string };

export function AdministratieScherm({ inhoud }: { inhoud: AdmInhoud }) {
  const { data, setAdm, setOndernemer, toast } = useApp();
  const adm = data.adm;
  const [tab, setTab] = useState<Tab>("potjes");
  const [bedrag, setBedrag] = useState("");
  const [klant, setKlant] = useState({ naam: "", adres: "" });
  const [nummer, setNummer] = useState("");
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10));
  const [termijn, setTermijn] = useState("30");
  const [regels, setRegels] = useState<Regel[]>([{ wat: "", aantal: "1", prijs: "" }]);
  // Vastgezet bij het openen, zodat een veld niet verspringt terwijl je typt.
  const [pctBoven] = useState(() => adm.belasting_pct === null);
  const [eigenOpen, setEigenOpen] = useState(() => { const x = adm.bedrijf; return !(x.naam && x.adres && x.kvk && x.btwid && x.iban); });

  if (!data.profile?.ondernemer)
    return (
      <main className="wrap">
        <div className="ph">
          <div className="lbl">Administratie</div>
          <h1>Dit scherm is voor ondernemers.</h1>
          <p>Je gaf bij de start aan dat je in een team werkt. Werk je inmiddels voor jezelf, zet het dan aan.</p>
        </div>
        <div className="btns" style={{ marginTop: 20 }}>
          <button className="btn" onClick={() => setOndernemer(true).catch(() => toast("Opslaan lukte niet."))}>Ik werk als ondernemer</button>
        </div>
      </main>
    );

  const tarief = adm.btw_tarief, pct = adm.belasting_pct;
  const Tarief = () => (
    <div className="f">
      <span>Btw-tarief</span>
      <div className="seg" role="group" aria-label="Btw-tarief">
        {TARIEVEN.map((t) => <button key={t} aria-pressed={tarief === t} onClick={() => setAdm({ btw_tarief: t })}>{t}%</button>)}
      </div>
    </div>
  );

  // Potjes
  const b = getal(bedrag), btw = (b * tarief) / 100, belasting = pct === null ? null : (b * pct) / 100;
  const pctVeld = (
    <label className="f">
      <span>Welk deel zet je opzij voor de belasting?</span>
      <small>Een percentage dat je zelf kiest. Weet je het niet, vraag het je boekhouder.</small>
      <input type="text" inputMode="decimal" value={pct === null ? "" : String(pct).replace(".", ",")} placeholder="Bijvoorbeeld het percentage van je boekhouder"
        onChange={(e) => { const v = e.target.value.trim(); setAdm({ belasting_pct: v === "" ? null : Math.min(Math.max(getal(v), 0), 100) }); }} />
    </label>
  );

  // Factuur
  const bd = adm.bedrijf;
  const zetBedrijf = (k: keyof Bedrijf) => (e: { target: { value: string } }) => setAdm({ bedrijf: { ...bd, [k]: e.target.value } });
  const zetRegel = (i: number, k: keyof Regel, v: string) => setRegels(regels.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const rijen = regels.filter((r) => r.wat || r.prijs).map((r) => ({ ...r, som: getal(r.aantal || "1") * getal(r.prijs) }));
  const sub = rijen.reduce((t, r) => t + r.som, 0), fbtw = (sub * tarief) / 100;
  const verval = new Date(new Date(datum).getTime() + (parseInt(termijn) || 0) * 864e5);
  const dag = (d: Date) => (isNaN(d.getTime()) ? "" : d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }));
  const eigenCompleet = !!(bd.naam && bd.adres && bd.kvk && bd.btwid && bd.iban);
  const mist = ([
    [!!(bd.naam && bd.adres), "je eigen naam en adres"],
    [!!bd.kvk, "je KvK-nummer"],
    [!!bd.btwid, "je btw-nummer"],
    [!!bd.iban, "je IBAN"],
    [!!(klant.naam && klant.adres), "naam en adres van je klant"],
    [!!nummer, "een factuurnummer"],
    [rijen.length > 0 && rijen.every((r) => r.wat) && sub > 0, "wat je leverde en voor welk bedrag"],
  ] as [boolean, string][]).filter((e) => !e[0]).map((e) => e[1]);
  const tekst = () =>
    [
      `FACTUUR ${nummer}`,
      `${bd.naam || ""}\n${bd.adres || ""}\nKvK ${bd.kvk || ""} · Btw-id ${bd.btwid || ""}`,
      `Aan: ${klant.naam}\n${klant.adres}`,
      `Factuurdatum: ${dag(new Date(datum))}\nBetalen voor: ${dag(verval)}`,
      rijen.map((r) => `${r.wat} · ${r.aantal || 1} × ${euro(getal(r.prijs))} = ${euro(r.som)}`).join("\n"),
      `Subtotaal: ${euro(sub)}\nBtw ${tarief}%: ${euro(fbtw)}\nTotaal: ${euro(sub + fbtw)}`,
      `Graag binnen ${termijn} dagen overmaken naar ${bd.iban || ""} t.n.v. ${bd.naam || ""}, onder vermelding van ${nummer}.`,
    ].join("\n\n");
  const Leeg = ({ v, wat }: { v?: string; wat: string }) => (v ? <>{v}</> : <span className="leeg">[{wat}]</span>);

  // Checklist
  const alle = inhoud.groepen.flatMap((g) => g.items.map((i) => i.id));
  const gedaan = adm.stappen_af.filter((x) => alle.includes(x)).length;
  const vink = (id: string, aan: boolean) => setAdm({ stappen_af: aan ? [...new Set([...adm.stappen_af, id])] : adm.stappen_af.filter((x) => x !== id) });

  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Voor ondernemers</div>
        <h1>Je administratie.</h1>
        {inhoud.inleiding && <div className="md" dangerouslySetInnerHTML={{ __html: inhoud.inleiding }} />}
      </div>

      <div className="tabs" role="tablist" aria-label="Administratie">
        {TABS.map(([k, t]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{t}</button>
        ))}
      </div>

      {tab === "potjes" && (
        <section className="paneel" role="tabpanel" aria-label="Potjes">
          <label className="f groot" style={{ marginTop: 0 }}>
            <span>Wat staat er op je factuur, zonder btw?</span>
            <input type="text" inputMode="decimal" value={bedrag} onChange={(e) => setBedrag(e.target.value)} placeholder="€ 1.500" />
          </label>
          {pctBoven && pctVeld}
          <div className="som" aria-live="polite">
            <div><span>Naar je btw-potje<small>{tarief}% btw. Dat geld is niet van jou.</small></span><b>{euro(btw)}</b></div>
            <div><span>Naar je belastingpotje<small>{pct === null ? "Vul eerst je percentage in." : `${String(pct).replace(".", ",")}% van het bedrag zonder btw.`}</small></span><b>{belasting === null ? "–" : euro(belasting)}</b></div>
            <div className="jij"><span>Voor jou</span><b>{belasting === null ? "–" : euro(b - belasting)}</b></div>
          </div>
          <details className="oef" style={{ marginTop: 16, marginBottom: 0 }}>
            <summary><span>Instellingen<small>{tarief}% btw{pct === null ? "" : `, ${String(pct).replace(".", ",")}% voor de belasting`}</small></span></summary>
            <div className="lb"><Tarief />{!pctBoven && pctVeld}</div>
          </details>
          {inhoud.potjes && <div className="md" style={{ marginTop: 16 }} dangerouslySetInnerHTML={{ __html: inhoud.potjes }} />}
          <p className="hint" style={{ marginTop: 14 }}>Een rekenhulp, geen belastingadvies.</p>
        </section>
      )}

      {tab === "factuur" && (
        <section className="paneel" role="tabpanel" aria-label="Factuur">
          <details className="oef" open={eigenOpen} onToggle={(e) => setEigenOpen(e.currentTarget.open)}>
            <summary><span>Jouw gegevens<small>{eigenCompleet ? `${bd.naam}, compleet en bewaard` : "Eén keer invullen, daarna bewaard"}</small></span></summary>
            <div className="lb">
              <label className="f"><span>Bedrijfsnaam</span><input type="text" value={bd.naam || ""} onChange={zetBedrijf("naam")} autoComplete="organization" /></label>
              <label className="f"><span>Adres</span><input type="text" value={bd.adres || ""} onChange={zetBedrijf("adres")} placeholder="Straat 1, 1234 AB Plaats" /></label>
              <label className="f"><span>KvK-nummer</span><input type="text" inputMode="numeric" value={bd.kvk || ""} onChange={zetBedrijf("kvk")} /></label>
              <label className="f"><span>Btw-nummer</span><input type="text" value={bd.btwid || ""} onChange={zetBedrijf("btwid")} placeholder="NL000000000B01" /></label>
              <label className="f"><span>IBAN</span><input type="text" value={bd.iban || ""} onChange={zetBedrijf("iban")} /></label>
            </div>
          </details>
          <label className="f"><span>Voor wie?</span><input type="text" value={klant.naam} onChange={(e) => setKlant({ ...klant, naam: e.target.value })} placeholder="Naam van je klant" /></label>
          <label className="f"><span>Adres van je klant</span><input type="text" value={klant.adres} onChange={(e) => setKlant({ ...klant, adres: e.target.value })} /></label>
          <div className="f">
            <span>Wat leverde je?</span>
            {regels.map((r, i) => (
              <div className="regels" key={i}>
                <input type="text" value={r.wat} onChange={(e) => zetRegel(i, "wat", e.target.value)} placeholder="Omschrijving" aria-label={`Omschrijving regel ${i + 1}`} />
                <input type="text" inputMode="decimal" value={r.aantal} onChange={(e) => zetRegel(i, "aantal", e.target.value)} placeholder="Aantal" aria-label={`Aantal regel ${i + 1}`} />
                <input type="text" inputMode="decimal" value={r.prijs} onChange={(e) => zetRegel(i, "prijs", e.target.value)} placeholder="Prijs" aria-label={`Prijs regel ${i + 1}`} />
                {regels.length > 1 ? <button className="btn ghost sm" onClick={() => setRegels(regels.filter((_, j) => j !== i))} aria-label={`Verwijder regel ${i + 1}`}>×</button> : <span />}
              </div>
            ))}
            <div className="btns" style={{ marginTop: 10 }}><button className="btn ghost sm" onClick={() => setRegels([...regels, { wat: "", aantal: "1", prijs: "" }])}>Regel erbij</button></div>
          </div>
          <label className="f"><span>Factuurnummer</span><input type="text" value={nummer} onChange={(e) => setNummer(e.target.value)} placeholder="2026-001" /></label>
          <details className="oef" style={{ marginTop: 16 }}>
            <summary><span>Datum, betaaltermijn en btw<small>{dag(new Date(datum))}, {termijn || "…"} dagen, {tarief}% btw</small></span></summary>
            <div className="lb">
              <label className="f"><span>Factuurdatum</span><input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} /></label>
              <label className="f"><span>Betaaltermijn in dagen</span><input type="text" inputMode="numeric" value={termijn} onChange={(e) => setTermijn(e.target.value)} /></label>
              <Tarief />
            </div>
          </details>

          <div className="factuur afdruk" aria-label="Voorbeeld van je factuur" style={{ background: "var(--bg)" }}>
            <h3>Factuur <Leeg v={nummer} wat="nummer" /></h3>
            <div className="koppen">
              <div><span>Van</span><b><Leeg v={bd.naam} wat="bedrijfsnaam" /></b><br /><Leeg v={bd.adres} wat="adres" /><br />KvK <Leeg v={bd.kvk} wat="KvK-nummer" /><br />Btw-id <Leeg v={bd.btwid} wat="btw-nummer" /></div>
              <div><span>Aan</span><b><Leeg v={klant.naam} wat="klant" /></b><br /><Leeg v={klant.adres} wat="adres klant" /><br /><span style={{ marginTop: 8 }}>Factuurdatum</span>{dag(new Date(datum))}<span style={{ marginTop: 8 }}>Betalen voor</span>{dag(verval)}</div>
            </div>
            <table>
              <thead><tr><th>Omschrijving</th><th>Aantal</th><th>Prijs</th><th>Bedrag</th></tr></thead>
              <tbody>
                {rijen.length ? rijen.map((r, i) => (
                  <tr key={i}><td><Leeg v={r.wat} wat="omschrijving" /></td><td>{r.aantal || 1}</td><td>{euro(getal(r.prijs))}</td><td>{euro(r.som)}</td></tr>
                )) : <tr><td colSpan={4}><span className="leeg">[wat je leverde]</span></td></tr>}
              </tbody>
              <tfoot>
                <tr><td>Subtotaal</td><td></td><td></td><td>{euro(sub)}</td></tr>
                <tr><td>Btw {tarief}%</td><td></td><td></td><td>{euro(fbtw)}</td></tr>
                <tr><td>Totaal</td><td></td><td></td><td>{euro(sub + fbtw)}</td></tr>
              </tfoot>
            </table>
            <p style={{ margin: "18px 0 0" }}>Graag binnen {termijn || "…"} dagen overmaken naar <Leeg v={bd.iban} wat="IBAN" /> t.n.v. <Leeg v={bd.naam} wat="bedrijfsnaam" />, onder vermelding van <Leeg v={nummer} wat="nummer" />.</p>
          </div>

          <div className={`fb ${mist.length ? "no" : "ok"}`} aria-live="polite">
            {mist.length ? <><b>Mist nog:</b> {mist.join(", ")}.</> : <><b>Alles staat erop.</b> Kijk de bedragen nog één keer zelf na.</>}
          </div>
          <div className="btns" style={{ marginTop: 14 }}>
            <button className="btn" onClick={() => navigator.clipboard.writeText(tekst()).then(() => toast("Factuur gekopieerd"), () => toast("Kopiëren lukte niet"))}>Kopieer</button>
            <button className="btn ghost" onClick={() => window.print()}>Bewaar als pdf</button>
            <a className="btn ghost" href="https://www.moneybird.nl" target="_blank" rel="noopener noreferrer">Naar Moneybird</a>
          </div>
          <p className="hint" style={{ marginTop: 14 }}>Jij verstuurt de factuur zelf. Hij wordt hier niet bewaard.</p>
        </section>
      )}

      {tab === "checklist" && (
        <section className="paneel lijst" role="tabpanel" aria-label="Checklist">
          <p className="hint" style={{ margin: "0 0 18px" }}>Wat er bij ondernemen komt kijken. {gedaan} van {alle.length} geregeld.</p>
          {inhoud.groepen.map((g) => (
            <div key={g.kop}>
              <h3>{g.kop}</h3>
              {g.items.map((i) => (
                <label key={i.id} className="vink">
                  <input type="checkbox" checked={adm.stappen_af.includes(i.id)} onChange={(e) => vink(i.id, e.target.checked)} />
                  <span>{i.titel}{i.html && <small dangerouslySetInnerHTML={{ __html: i.html }} />}</span>
                </label>
              ))}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
