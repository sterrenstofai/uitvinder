"use client";
// Rolscan: stap 1. De week gaat alleen naar de AI; bewaard wordt de uitkomst.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app";
import { Cover } from "@/components/Cover";
import { Scan, zetWacht, type Uitkomst } from "@/components/Scan";
import { curExp } from "@/lib/afgeleid";
import type { Rol } from "@/lib/types";

export default function Rolscan() {
  const { data, nieuweScan, nieuwExp, toast } = useApp();
  const router = useRouter();
  const [bewaren, setBewaren] = useState(false);

  async function bewaar(rol: Rol, r: Uitkomst) {
    setBewaren(true);
    try {
      await nieuweScan(rol, r);
      const x = r.experiment || {};
      // Het experiment uit de scan staat klaar als ronde, tenzij er al een ronde loopt.
      if (!curExp(data)) await nieuwExp({ signaal: x.signaal || "", hypothese: x.hypothese || "", bouw: x.bouw || "", meting: x.meten || "", titel: r.kort || "" });
      zetWacht(null);
      toast("Opgeslagen");
      router.push("/vandaag");
    } catch {
      toast("Opslaan lukte niet. Probeer het opnieuw.");
      setBewaren(false);
    }
  }

  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Rolscan</div>
        <h1>Ben jij uitvoerder of uitvinder?</h1>
        <p>Beschrijf je afgelopen werkweek en zie waar jij staat. Je krijgt er één experiment bij voor volgende week.</p>
      </div>
      <Scan startRol={data.profile?.rol ?? "designer"} eerste={!data.scans.length} wacht={!data.scans.length} onder={(rol, r) => (
        <section className="next">
          <Cover seed="stap1" w={800} h={360} cls="lg" />
          <span className="k">Dit is stap 1</span>
          <h2>Bewaar dit als {data.scans.length ? "nieuwe meting" : "je nulmeting"}.</h2>
          <p>{curExp(data) ? "Je lopende ronde blijft staan." : "Je experiment komt klaar te staan als ronde."}</p>
          <div className="btns"><button className="btn" onClick={() => bewaar(rol, r)} disabled={bewaren}>{bewaren ? "Bezig…" : "Bewaar en ga verder"}</button></div>
        </section>
      )} />
    </main>
  );
}
