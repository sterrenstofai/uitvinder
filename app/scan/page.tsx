"use client";
// De gratis Rolscan, zonder account. De uitkomst wacht in je browser tot je een account maakt.
import Link from "next/link";
import { Cover } from "@/components/Cover";
import { Kop, Voet } from "@/components/Kop";
import { Scan, zetWacht } from "@/components/Scan";

export default function GratisScan() {
  return (
    <>
      <Kop nav={false} />
      <main className="wrap">
        <div className="ph">
          <div className="lbl">Gratis Rolscan</div>
          <h1>Ben jij uitvoerder of uitvinder?</h1>
          <p>Beschrijf je afgelopen werkweek en zie waar jij staat. Je krijgt er één experiment bij voor volgende week. Zonder account, in vijf minuten.</p>
        </div>
        <Scan startRol="designer" eerste onUitkomst={(rol, r) => zetWacht({ rol, r })} onder={() => (
          <section className="next">
            <Cover seed="stap1" w={800} h={360} cls="lg" />
            <span className="k">Dit is stap 1 van 5</span>
            <h2>Bewaar dit als je nulmeting.</h2>
            <p>Maak een account met je e-mailadres. Je uitkomst staat daarna klaar bij de Rolscan, en het experiment wordt je eerste ronde.</p>
            <div className="btns"><Link className="btn" href="/login">Maak je account</Link></div>
            <p className="hint" style={{ marginTop: 12 }}>Je uitkomst blijft tot die tijd alleen in deze browser staan. Open de inloglink dus in dezelfde browser.</p>
          </section>
        )} />
      </main>
      <Voet />
    </>
  );
}
