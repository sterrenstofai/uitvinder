"use client";
// Een ronde: stap 3 tot en met 5. Elke ronde levert een experimentkaart op.
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app";
import { Cover } from "@/components/Cover";
import { CoachBox, LesBox } from "@/components/Les";
import { Proeftuin3, Proeftuin4, Proeftuin5 } from "@/components/Proeftuin";
import { expTitel, fmtD, weekNr } from "@/lib/afgeleid";
import type { Les } from "@/lib/lessen";
import type { Exp, Zichtbaarheid } from "@/lib/types";

type Tekstveld = "klant" | "signaal" | "waarom" | "titel" | "hypothese" | "keuze" | "bouw" | "tool" | "spec" | "link" | "meting" | "uitkomst" | "geleerd";

export function Ronde({ id, lessen }: { id: string; lessen: Record<3 | 4 | 5, Les> }) {
  const { data, nieuwExp, setExp, verwijderExp, toast } = useApp();
  const router = useRouter();
  const gestart = useRef(false);

  useEffect(() => {
    if (id !== "nieuw" || gestart.current) return;
    gestart.current = true;
    nieuwExp().then((e) => router.replace(`/ronde/${e.id}`), () => { toast("Een ronde starten lukte niet."); router.replace("/reis"); });
  }, [id, nieuwExp, router, toast]);

  if (id === "nieuw") return <main className="wrap" style={{ minHeight: "60vh" }} aria-busy="true" />;
  const e = data.exps.find((x) => x.id === id);
  if (!e)
    return (
      <main className="wrap">
        <div className="ph"><h1>Deze ronde bestaat niet.</h1></div>
        <div className="btns" style={{ marginTop: 20 }}><Link className="btn" href="/reis">Naar je reis</Link></div>
      </main>
    );

  const zet = (patch: Partial<Exp>) => setExp(e.id, patch);
  const veld = (k: Tekstveld) => ({ value: e[k], onChange: (ev: { target: { value: string } }) => zet({ [k]: ev.target.value }) });
  const ctx = () =>
    `Rol: ${data.profile?.rol || ""}\nInvalshoek: ${data.inv.zin}\nKlant: ${e.klant}\nSignaal: ${e.signaal}\nWaarom dit merk: ${e.waarom}\nHypothese: ${e.hypothese}\nWat ik bouw: ${e.bouw}\nTools: ${e.tool}\nMeting: ${e.meting}\nUitkomst: ${e.uitkomst}\nGeleerd: ${e.geleerd}`;

  function zicht(v: Zichtbaarheid) {
    if (v === "team") {
      const team = data.teamIds[0];
      if (!team) toast("Je zit nog niet in een team. Tot dan ziet alleen jij deze kaart.");
      zet({ zichtbaarheid: v, team_id: team ?? null });
    } else zet({ zichtbaarheid: v });
  }
  function rondAf() {
    if (!e!.hypothese.trim() || !e!.uitkomst.trim()) return toast("Vul minstens hypothese en uitkomst in");
    zet({ status: "af" });
    toast("In je library gezet");
    router.push("/library");
  }
  async function verwijder() {
    if (!confirm("Deze ronde verwijderen?")) return;
    try {
      await verwijderExp(e!.id);
      router.replace("/reis");
    } catch {
      toast("Verwijderen lukte niet.");
    }
  }

  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Ronde, week {e.week || weekNr(data)}</div>
        <h1>{expTitel(e)}</h1>
        {e.remix_titel && <p className="hint">Remix van ‘{e.remix_titel}’ van {e.remix_auteur}</p>}
        <div className="excv"><Cover seed={e.id + (e.titel || "")} w={640} h={240} /></div>
      </div>

      <section className="step">
        <div className="step-h"><b>3</b><h2>Relevantie zoeken</h2><span>Waarom nu?</span></div>
        <div className="step-b">
          <LesBox les={lessen[3]} />
          <Proeftuin3 e={e} />
          <label className="f"><span>Voor welke klant of welk merk?</span><input type="text" {...veld("klant")} placeholder="Klantnaam" /></label>
          <label className="f"><span>Het signaal</span><small>Nieuws, een vraag van de doelgroep, een moment in de markt. Iets van deze week.</small><textarea {...veld("signaal")} placeholder="Wat zag je?" /></label>
          <label className="f"><span>Waarom heeft dit merk er iets over te zeggen?</span><textarea {...veld("waarom")} /></label>
          <CoachBox stap="signaal" context={ctx} />
        </div>
      </section>

      <section className="step">
        <div className="step-h"><b>4</b><h2>Uitvinden</h2><span>Bouwen in een middag</span></div>
        <div className="step-b">
          <LesBox les={lessen[4]} />
          <Proeftuin4 e={e} neem={zet} />
          <label className="f"><span>Naam van je experiment</span><input type="text" {...veld("titel")} placeholder="Kort en concreet" /></label>
          <label className="f"><span>Hypothese</span><textarea {...veld("hypothese")} placeholder="Als ik ..., dan verwacht ik ..., omdat ..." /></label>
          <label className="f"><span>Waarom deze keuze?</span><small>Wat maakt dit belangrijker dan de andere opties die je had?</small><textarea {...veld("keuze")} /></label>
          <label className="f"><span>Wat bouw je?</span><textarea {...veld("bouw")} placeholder="Eén zin: wat het is en wat het doet" /></label>
          <label className="f"><span>Met welke tools?</span><input type="text" {...veld("tool")} placeholder="Bijvoorbeeld: Claude, Netlify" /></label>
          <label className="f"><span>De spec of prompt waarmee je het bouwde</span><small>Hiermee kan een collega je experiment remixen.</small><textarea {...veld("spec")} placeholder="Plak hier je spec" /></label>
          <label className="f"><span>Link naar wat je bouwde</span><input type="url" {...veld("link")} placeholder="https://" /></label>
          <label className="f"><span>Hoe meet je?</span><input type="text" {...veld("meting")} placeholder="Eén getal of één reactie" /></label>
          <div className="btns"><Link className="btn ghost sm" href="/volgt/bouwen">Hulp bij bouwen</Link></div>
          <CoachBox stap="experiment" context={ctx} />
        </div>
      </section>

      <section className={`step ${e.status === "af" ? "done" : ""}`}>
        <div className="step-h"><b>5</b><h2>Zichtbaar maken</h2><span>Wat leverde het op?</span></div>
        <div className="step-b">
          <LesBox les={lessen[5]} />
          <Proeftuin5 e={e} neem={zet} />
          <label className="f"><span>Uitkomst</span><textarea {...veld("uitkomst")} placeholder="Wat zeggen de cijfers of reacties?" /></label>
          <label className="f"><span>Wat leerde je?</span><small>Los van of het werkte.</small><textarea {...veld("geleerd")} /></label>
          <div className="f">
            <span>Wie ziet deze kaart?</span>
            <div className="seg" role="group" aria-label="Zichtbaarheid">
              {([["prive", "Alleen ik"], ["team", "Mijn team"], ["publiek", "Iedereen"]] as [Zichtbaarheid, string][]).map(([k, t]) => (
                <button key={k} aria-pressed={e.zichtbaarheid === k} onClick={() => zicht(k)}>{t}</button>
              ))}
            </div>
          </div>
          <CoachBox stap="zichtbaar" context={ctx} />
          <div className="btns" style={{ marginTop: 18 }}>
            {e.status === "af" ? (
              <>
                <span className="tag dk">Afgerond</span>
                <button className="btn ghost sm" onClick={() => zet({ status: "bezig" })}>Heropen</button>
              </>
            ) : (
              <button className="btn" onClick={rondAf}>Rond af en zet in je library</button>
            )}
            <button className="btn ghost sm" onClick={() => window.print()}>Bewaar kaart als pdf</button>
            <button className="btn ghost sm" onClick={verwijder}>Verwijder ronde</button>
          </div>
        </div>
      </section>

      {/* Alleen bij afdrukken: de experimentkaart op één blad, om te bewaren of aan de klant te geven. */}
      <article className="afdruk alleen-print kaartblad">
        <p className="kb-k">Experimentkaart{e.klant ? `, ${e.klant}` : ""}</p>
        <h1>{expTitel(e)}</h1>
        <p className="kb-m">{[e.auteur || data.profile?.naam, fmtD(e.datum), e.status === "af" ? "Afgerond" : "Loopt nog"].filter(Boolean).join(" · ")}</p>
        {([["Signaal", e.signaal], ["Waarom dit merk", e.waarom], ["Hypothese", e.hypothese], ["Waarom deze keuze", e.keuze], ["Gebouwd", [e.bouw, e.tool && `(${e.tool})`].filter(Boolean).join(" ")], ["Link", e.link], ["Meting", e.meting], ["Uitkomst", e.uitkomst], ["Geleerd", e.geleerd], ["Spec", e.spec]] as [string, string][])
          .filter(([, v]) => v.trim())
          .map(([k, v]) => <div key={k} className="kb-r"><span>{k}</span><p>{v}</p></div>)}
        <p className="kb-v">Van uitvoerder naar uitvinder · Thijs Mensink</p>
      </article>
    </main>
  );
}
