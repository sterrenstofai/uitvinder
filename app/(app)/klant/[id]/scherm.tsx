"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app";
import { Cover } from "@/components/Cover";
import { Kaart } from "@/components/Kaart";
import { STATUSNAAM, TOOLNAMEN, VOORBEELDNAMEN } from "@/lib/cockpit";
import { markt } from "@/lib/markt";

export function Klantdossier({ id }: { id: string }) {
  const { data, nieuwExp, verwijderKlant, toast } = useApp();
  const router = useRouter();
  const k = data.klanten.find((x) => x.id === id);
  if (!k)
    return (
      <main className="wrap">
        <div className="ph"><h1>Deze klant bestaat niet.</h1></div>
        <div className="btns" style={{ marginTop: 20 }}><Link className="btn" href="/cockpit">Naar de cockpit</Link></div>
      </main>
    );
  const taken = data.taken.filter((t) => t.klant_id === id);
  const exps = data.exps.filter((e) => e.klant.trim().toLowerCase() === k.naam.toLowerCase());
  const actief = (tool: string) => data.koppelingen.some((x) => x.klant_id === id && x.tool === tool && x.status === "actief");
  const tr = markt(data).trends.filter((t) => k.sector && t.sectoren.includes(k.sector));
  async function signaal(tekst: string) {
    try {
      const e = await nieuwExp({ klant: k!.naam, signaal: tekst });
      toast("Signaal in een nieuwe ronde gezet");
      router.push(`/ronde/${e.id}`);
    } catch {
      toast("Dat lukte niet.");
    }
  }
  async function ronde() {
    try {
      const e = await nieuwExp({ klant: k!.naam });
      router.push(`/ronde/${e.id}`);
    } catch {
      toast("Een ronde starten lukte niet.");
    }
  }
  async function verwijder() {
    if (!confirm(`${k!.naam} verwijderen, met de taken en koppelingen? Je experimentkaarten blijven staan.`)) return;
    try {
      await verwijderKlant(id);
      router.replace("/cockpit");
    } catch {
      toast("Verwijderen lukte niet.");
    }
  }
  return (
    <main className="wrap wide">
      <section className="dash-h">
        <Cover seed={"klant" + k.naam} w={1200} h={520} cls="lg" />
        <div className="lbl">Klantdossier{k.sector ? `, ${k.sector}` : ""}{VOORBEELDNAMEN.includes(k.naam) ? " (voorbeeld)" : ""}</div>
        <h1>{k.naam}</h1>
        <div className="kpi">
          <div><span>Klaar voor jou</span><b>{taken.filter((t) => t.status === "klaar").length}</b></div>
          <div><span>Experimenten</span><b>{exps.length}</b></div>
          <div><span>Koppelingen</span><b>{TOOLNAMEN.filter(actief).length}</b></div>
        </div>
      </section>
      <div className="dash">
        <div>
          <div className="grp"><span>Het merk</span></div>
          <div className="exp" style={{ marginTop: 10 }}>
            <dl>
              <div><dt>Merk</dt><dd>{k.merk || "–"}</dd></div>
              <div><dt>Doelgroep</dt><dd>{k.doelgroep || "–"}</dd></div>
              <div><dt>Kanalen</dt><dd>{k.kanalen.join(", ") || "–"}</dd></div>
              <div><dt>Sector</dt><dd>{k.sector || "–"}</dd></div>
            </dl>
          </div>
          <div className="grp"><span>Lopend werk</span><Link href="/cockpit" className="hint">Naar de cockpit</Link></div>
          {taken.length ? taken.map((t) => (
            <div key={t.id} className="tmini">
              <span className={`tag ${t.status === "klaar" ? "ui" : t.status === "goedgekeurd" ? "on" : "off"}`} style={{ justifySelf: "start" }}>{STATUSNAAM[t.status]}</span>
              <b>{t.titel}</b><span className="hint">{t.agent}, in {t.tool}</span>
            </div>
          )) : <div className="empty" style={{ marginTop: 10 }}>Geen lopend werk. Agents voor je eigen klanten volgen.</div>}
          <div className="grp"><span>Experimenten voor deze klant</span><span>{exps.length}</span></div>
          {exps.length ? <div style={{ marginTop: 10 }}>{exps.slice().reverse().map((e) => <Kaart key={e.id} e={e} eigen />)}</div> : <div className="empty" style={{ marginTop: 10 }}>Nog geen experimenten.</div>}
          <div className="btns" style={{ marginTop: 16 }}>
            <button className="btn" onClick={ronde}>Start een ronde voor deze klant</button>
            <button className="btn ghost sm" onClick={verwijder}>Verwijder klant</button>
          </div>
        </div>
        <div>
          {k.sector && (
            <>
              <div className="grp"><span>Trends voor {k.sector.toLowerCase()}</span><Link href="/markt" className="hint">Markt</Link></div>
              {tr.slice(0, 4).map((t) => (
                <div key={t.id} className="tmini">
                  <span className="mom" style={{ justifySelf: "start" }}>{t.momentum}</span>
                  <b>{t.titel}</b><span className="hint">{t.wat_je_kunt_doen}</span>
                  <div className="btns"><button className="btn ghost sm" onClick={() => signaal(`${t.titel}. ${t.uitleg}`)}>Maak er een signaal van</button></div>
                </div>
              ))}
              {!tr.length && <p className="hint">Geen trends voor deze sector.</p>}
            </>
          )}
          <div className="grp"><span>Koppelingen</span></div>
          <div className="kop">{TOOLNAMEN.map((n) => <div key={n}><span>{n}</span><span className={`tag ${actief(n) ? "on" : "off"}`}>{actief(n) ? "Gekoppeld" : "Niet gekoppeld"}</span></div>)}</div>
          <p className="hint" style={{ marginTop: 8 }}>Nagebootst: er wordt nog niets echt gekoppeld.</p>
        </div>
      </div>
    </main>
  );
}
