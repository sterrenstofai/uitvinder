"use client";
// Het certificaat. Een certificaat van deze aanbieder, geen erkend diploma.
import Link from "next/link";
import { useApp } from "@/components/app";
import { fmtD } from "@/lib/afgeleid";
import { getal1, SLAAGGRENS } from "@/lib/toetsing";

const KAN = [
  "analyseert welk deel van de eigen rol uitvoerend is en waarom AI dat overneemt;",
  "signaleert zelfstandig relevante momenten voor een merk en beoordeelt die;",
  "ontwerpt, bouwt en meet experimenten met AI-tools op basis van een toetsbare hypothese;",
  "presenteert uitkomsten aan team, klant en publiek;",
  "reflecteert op eigen aannames en stuurt de eigen ontwikkeling bij.",
];

export default function Certificaat() {
  const { data } = useApp();
  const b = data.beoordeling;
  if (!b || b.cijfer === null || b.cijfer < SLAAGGRENS)
    return (
      <main className="wrap">
        <div className="ph">
          <div className="lbl">Certificaat</div>
          <h1>Je certificaat staat hier zodra je geslaagd bent.</h1>
          <p>Je krijgt het na een voldoende beoordeling van je portfolio en je eindopdracht.</p>
        </div>
        <div className="btns" style={{ marginTop: 20 }}><Link className="btn" href="/portfolio">Naar je portfolio</Link></div>
      </main>
    );
  return (
    <main className="wrap wide">
      <div className="ph">
        <div className="lbl">Certificaat</div>
        <h1>Gefeliciteerd, {(data.profile?.naam || "").split(" ")[0]}.</h1>
        <div className="btns" style={{ marginTop: 14 }}><button className="btn" onClick={() => window.print()}>Bewaar als pdf</button></div>
      </div>
      <article className="afdruk cert">
        <div className="cert-k"><span className="dotm" aria-hidden="true"></span>Uitvinder, door Thijs Mensink</div>
        <p className="cert-l">Certificaat</p>
        <h2>{data.profile?.naam}</h2>
        <p className="cert-t">heeft het leertraject <b>Van uitvoerder naar uitvinder</b> afgerond met het eindcijfer <b>{getal1(b.cijfer)}</b>.</p>
        <p className="cert-s">Twaalf weken, ongeveer 56 uur studielast. Getoetst met een portfolio van drie experimenten (60%) en een eindopdracht met pitch en reflectieverslag (40%), beoordeeld door een mens.</p>
        <div className="cert-lu">
          <span>De deelnemer</span>
          <ul>{KAN.map((k) => <li key={k}>{k}</li>)}</ul>
        </div>
        <div className="cert-v">
          <div><span>Vastgesteld op</span><b>{fmtD(b.vastgesteld_op!)}</b></div>
          <div><span>Beoordelaar</span><b>{b.beoordelaar_naam || "–"}</b></div>
          <div><span>Certificaatnummer</span><b>{b.id.slice(0, 8).toUpperCase()}</b></div>
        </div>
        <p className="cert-n">Dit is een certificaat van de aanbieder. Het is geen erkend diploma en geeft geen studiepunten.</p>
      </article>
    </main>
  );
}
