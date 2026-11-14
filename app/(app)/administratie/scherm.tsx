"use client";
// Ontzorging voor ondernemers, eerste versie: opzetlijst, potjes-rekenhulp en factuurhulp.
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
type Regel = { wat: string; aantal: string; prijs: string };

export function AdministratieScherm({ inhoud }: { inhoud: AdmInhoud }) {
  const { data, setAdm, setOndernemer, toast } = useApp();
  const adm = data.adm;
  const [bedrag, setBedrag] = useState("");
  const [klant, setKlant] = useState({ naam: "", adres: "" });
  const [nummer, setNummer] = useState("");
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10));
  const [termijn, setTermijn] = useState("30");
  const [regels, setRegels] = useState<Regel[]>([{ wat: "", aantal: "1", prijs: "" }]);

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

  // Potjes
  const b = getal(bedrag), tarief = adm.btw_tarief, pct = adm.belasting_pct;
  const btw = (b * tarief) / 100, belasting = pct === null ? null : (b * pct) / 100;

  // Factuur
  const bd = adm.bedrijf;
  const zetBedrijf = (k: keyof Bedrijf) => (e: { target: { value: string } }) => setAdm({ bedrijf: { ...bd, [k]: e.target.value } });
  const zetRegel = (i: number, k: keyof Regel, v: string) => setRegels(regels.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const rijen = regels.filter((r) => r.wat || r.prijs).map((r) => ({ ...r, som: getal(r.aantal || "1") * getal(r.prijs) }));
  const sub = rijen.reduce((t, r) => t + r.som, 0), fbtw = (sub * tarief) / 100;
  const verval = new Date(new Date(datum).getTime() + (parseInt(termijn) || 0) * 864e5);
  const dag = (d: Date) => (isNaN(d.getTime()) ? "" : d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }));
  const eisen: [boolean, string][] = [
    [!!(bd.naam && bd.adres), "Je eigen naam en adres"],
    [!!bd.kvk, "Je KvK-nummer"],
    [!!bd.btwid, "Je btw-identificatienummer"],
    [!!(klant.naam && klant.adres), "Naam en adres van je klant"],
    [!!nummer, "Een factuurnummer"],
    [!!datum, "De factuurdatum"],
    [rijen.length > 0 && rijen.every((r) => r.wat), "Wat je leverde, en hoeveel"],
    [sub > 0, "Het bedrag zonder btw, het btw-tarief en het btw-bedrag"],
    [!!bd.iban, "Je IBAN, zodat de klant kan betalen"],
  ];
  const mist = eisen.filter((e) => !e[0]).length;
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

  const af = (i: number) => adm.stappen_af.includes(i);
  const vink = (i: number, aan: boolean) => setAdm({ stappen_af: aan ? [...new Set([...adm.stappen_af, i])].sort() : adm.stappen_af.filter((x) => x !== i) });
  const Leeg = ({ v, wat }: { v?: string; wat: string }) => (v ? <>{v}</> : <span className="leeg">[{wat}]</span>);

  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Administratie, voor ondernemers</div>
        <h1>Je administratie geregeld.</h1>
        <div className="md volgt" dangerouslySetInnerHTML={{ __html: inhoud.inleiding }} />
      </div>

      <div className="grp"><span>Opzetlijst</span><span>{adm.stappen_af.length} van {inhoud.stappen.length} gedaan</span></div>
      {inhoud.stappen.map((s, i) => (
        <section key={s.titel} className={`step ${af(i) ? "done" : ""}`}>
          <div className="step-h"><b>{af(i) ? "✓" : i + 1}</b><h2>{s.titel}</h2></div>
          <div className="step-b">
            <div className="md volgt" dangerouslySetInnerHTML={{ __html: s.html }} />
            {i === 0 && <div className="btns" style={{ marginTop: 12 }}><a className="btn ghost sm" href="https://www.moneybird.nl" target="_blank" rel="noopener noreferrer">Naar Moneybird</a></div>}
            {i === 1 && <div className="btns" style={{ marginTop: 12 }}><a className="btn ghost sm" href="#potjes">Naar de rekenhulp</a></div>}
            {i === 2 && <div className="btns" style={{ marginTop: 12 }}><a className="btn ghost sm" href="#factuur">Naar de factuurhulp</a></div>}
            <label className="afvink"><input type="checkbox" checked={af(i)} onChange={(e) => vink(i, e.target.checked)} />Gedaan</label>
          </div>
        </section>
      ))}

      <div className="grp" id="potjes"><span>Potjes-rekenhulp</span><span>Per factuur</span></div>
      <section className="step">
        <div className="step-h"><b>€</b><h2>Wat zet je opzij?</h2></div>
        <div className="step-b">
          <div className="md volgt" dangerouslySetInnerHTML={{ __html: inhoud.potjes }} />
          <label className="f"><span>Factuurbedrag zonder btw</span><input type="text" inputMode="decimal" value={bedrag} onChange={(e) => setBedrag(e.target.value)} placeholder="1.500" /></label>
          <div className="f">
            <span>Btw-tarief</span>
            <div className="seg" role="group" aria-label="Btw-tarief">
              {TARIEVEN.map((t) => <button key={t} aria-pressed={tarief === t} onClick={() => setAdm({ btw_tarief: t })}>{t}%</button>)}
            </div>
          </div>
          <label className="f">
            <span>Jouw percentage voor het belastingpotje</span>
            <small>Dit kies je zelf, over het bedrag zonder btw. Weet je het niet, vraag het je boekhouder.</small>
            <input type="text" inputMode="decimal" value={pct === null ? "" : String(pct).replace(".", ",")} placeholder="Vul je eigen percentage in"
              onChange={(e) => { const v = e.target.value.trim(); setAdm({ belasting_pct: v === "" ? null : Math.min(Math.max(getal(v), 0), 100) }); }} />
          </label>
          <div className="cmp" style={{ marginTop: 16 }}>
            <div><span>Naar je btw-potje</span><b>{euro(btw)}</b><span>{tarief}% btw, die is niet van jou</span></div>
            <div><span>Naar je belastingpotje</span><b>{belasting === null ? "–" : euro(belasting)}</b><span>{pct === null ? "vul je percentage in" : `${String(pct).replace(".", ",")}% van ${euro(b)}`}</span></div>
          </div>
          <div className="prev" style={{ marginTop: 12 }}>
            Je klant betaalt {euro(b + btw)}. {belasting === null ? "Vul je percentage in om te zien wat je overhoudt." : `Na beide potjes houd je ${euro(b - belasting)} over.`}
          </div>
          <p className="hint" style={{ marginTop: 12 }}>Dit is een rekenhulp en geen belastingadvies. De rekenhulp weet niets van je aftrekposten, je andere inkomen of je regelingen.</p>
        </div>
      </section>

      <div className="grp" id="factuur"><span>Factuurhulp</span><span>Jij verstuurt</span></div>
      <section className="step">
        <div className="step-h"><b>✎</b><h2>Zet je factuur op</h2></div>
        <div className="step-b">
          <p className="hint">Vul in, controleer en neem de factuur over in Moneybird. Je eigen gegevens worden bewaard, de factuur zelf niet.</p>
          <h4>Jouw gegevens</h4>
          <label className="f"><span>Bedrijfsnaam</span><input type="text" value={bd.naam || ""} onChange={zetBedrijf("naam")} autoComplete="organization" /></label>
          <label className="f"><span>Adres</span><input type="text" value={bd.adres || ""} onChange={zetBedrijf("adres")} placeholder="Straat 1, 1234 AB Plaats" /></label>
          <label className="f"><span>KvK-nummer</span><input type="text" inputMode="numeric" value={bd.kvk || ""} onChange={zetBedrijf("kvk")} /></label>
          <label className="f"><span>Btw-identificatienummer</span><input type="text" value={bd.btwid || ""} onChange={zetBedrijf("btwid")} placeholder="NL000000000B01" /></label>
          <label className="f"><span>IBAN</span><input type="text" value={bd.iban || ""} onChange={zetBedrijf("iban")} /></label>
          <h4>Deze factuur</h4>
          <label className="f"><span>Klant</span><input type="text" value={klant.naam} onChange={(e) => setKlant({ ...klant, naam: e.target.value })} placeholder="Naam van het bedrijf" /></label>
          <label className="f"><span>Adres van de klant</span><input type="text" value={klant.adres} onChange={(e) => setKlant({ ...klant, adres: e.target.value })} /></label>
          <label className="f"><span>Factuurnummer</span><small>Doorlopend genummerd: elk nummer komt één keer voor.</small><input type="text" value={nummer} onChange={(e) => setNummer(e.target.value)} placeholder="2026-001" /></label>
          <label className="f"><span>Factuurdatum</span><input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} /></label>
          <label className="f"><span>Betaaltermijn in dagen</span><input type="text" inputMode="numeric" value={termijn} onChange={(e) => setTermijn(e.target.value)} /></label>
          <div className="f">
            <span>Wat je leverde</span>
            {regels.map((r, i) => (
              <div className="regels" key={i}>
                <input type="text" value={r.wat} onChange={(e) => zetRegel(i, "wat", e.target.value)} placeholder="Omschrijving" aria-label={`Omschrijving regel ${i + 1}`} />
                <input type="text" inputMode="decimal" value={r.aantal} onChange={(e) => zetRegel(i, "aantal", e.target.value)} placeholder="Aantal" aria-label={`Aantal regel ${i + 1}`} />
                <input type="text" inputMode="decimal" value={r.prijs} onChange={(e) => zetRegel(i, "prijs", e.target.value)} placeholder="Prijs per stuk" aria-label={`Prijs regel ${i + 1}`} />
                {regels.length > 1 ? <button className="btn ghost sm" onClick={() => setRegels(regels.filter((_, j) => j !== i))} aria-label={`Verwijder regel ${i + 1}`}>×</button> : <span />}
              </div>
            ))}
            <div className="btns" style={{ marginTop: 10 }}><button className="btn ghost sm" onClick={() => setRegels([...regels, { wat: "", aantal: "1", prijs: "" }])}>Regel erbij</button></div>
          </div>

          <div className="factuur" aria-label="Voorbeeld van je factuur">
            <h3>Factuur <Leeg v={nummer} wat="nummer" /></h3>
            <div className="koppen">
              <div><span>Van</span><b><Leeg v={bd.naam} wat="bedrijfsnaam" /></b><br /><Leeg v={bd.adres} wat="adres" /><br />KvK <Leeg v={bd.kvk} wat="KvK-nummer" /><br />Btw-id <Leeg v={bd.btwid} wat="btw-id" /></div>
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
                <tr><td colSpan={3}>Subtotaal</td><td>{euro(sub)}</td></tr>
                <tr><td colSpan={3}>Btw {tarief}%</td><td>{euro(fbtw)}</td></tr>
                <tr><td colSpan={3}>Totaal</td><td>{euro(sub + fbtw)}</td></tr>
              </tfoot>
            </table>
            <p style={{ margin: "18px 0 0" }}>Graag binnen {termijn || "…"} dagen overmaken naar <Leeg v={bd.iban} wat="IBAN" /> t.n.v. <Leeg v={bd.naam} wat="bedrijfsnaam" />, onder vermelding van <Leeg v={nummer} wat="nummer" />.</p>
          </div>

          <h4>Staat alles erop?</h4>
          <div className="chks">{eisen.map(([y, t]) => <span key={t} className={y ? "y" : ""}>{t}</span>)}</div>
          <p className="hint" style={{ marginTop: 10 }}>{mist ? `Er ${mist === 1 ? "mist nog 1 onderdeel" : `missen nog ${mist} onderdelen`}. Bij een verlegde of vrijgestelde btw gelden andere regels; vraag dat na.` : "Alles staat erop. Controleer de bedragen nog één keer zelf."}</p>
          <div className="btns" style={{ marginTop: 14 }}>
            <button className="btn" onClick={() => navigator.clipboard.writeText(tekst()).then(() => toast("Factuur gekopieerd"), () => toast("Kopiëren lukte niet"))}>Kopieer als tekst</button>
            <button className="btn ghost" onClick={() => window.print()}>Print of bewaar als pdf</button>
            <a className="btn ghost" href="https://www.moneybird.nl" target="_blank" rel="noopener noreferrer">Naar Moneybird</a>
          </div>
        </div>
      </section>
    </main>
  );
}
