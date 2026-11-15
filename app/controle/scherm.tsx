"use client";
// Een certificaat controleren op nummer. Openbaar: toont alleen naam, datum en beoordelaar.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Kop, Voet } from "@/components/Kop";
import { fmtD } from "@/lib/afgeleid";
import { getStore } from "@/lib/store";

type Cert = { naam: string; vastgesteld_op: string; beoordelaar: string | null };

export function Controle({ nummer }: { nummer?: string }) {
  const router = useRouter();
  const [nr, setNr] = useState(nummer || "");
  const [c, setC] = useState<Cert | null | undefined>(undefined);
  useEffect(() => {
    if (!nummer) return;
    getStore().controleerCertificaat(nummer).then(setC, () => setC(null));
  }, [nummer]);
  const schoon = nr.trim().toUpperCase();
  return (
    <>
      <Kop nav={false} />
      <main className="wrap">
        <div className="ph">
          <div className="lbl">Certificaat controleren</div>
          {!nummer ? <><h1>Is dit certificaat echt?</h1><p>Vul het nummer in dat onderaan het certificaat staat.</p></>
            : c === undefined ? <h1 aria-busy="true">Even kijken…</h1>
            : c ? <><h1>Dit certificaat is echt.</h1><p>Certificaat {nummer.toUpperCase()} is uitgereikt aan <b>{c.naam}</b> op {fmtD(c.vastgesteld_op)}{c.beoordelaar ? <>, beoordeeld door {c.beoordelaar}</> : null}.</p></>
            : <><h1>Dit nummer kennen we niet.</h1><p>Controleer het nummer op het certificaat. Het telt acht tekens.</p></>}
        </div>
        {c && <p className="hint">Het certificaat hoort bij de leerroute Van uitvoerder naar uitvinder, van Thijs Mensink. Het is een certificaat van deze aanbieder en geen erkend diploma. Wat ervoor gevraagd wordt, staat in de <a href="/studiewijzer">studiewijzer</a>.</p>}
        <form style={{ marginTop: 24, maxWidth: 420 }} onSubmit={(e) => { e.preventDefault(); if (schoon.length === 8) router.push("/controle/" + schoon); }}>
          <label className="f"><span>Certificaatnummer</span><input type="text" value={nr} onChange={(e) => setNr(e.target.value)} maxLength={8} placeholder="8 tekens" autoCapitalize="characters" /></label>
          <div className="btns"><button className="btn" disabled={schoon.length !== 8}>Controleer</button></div>
        </form>
      </main>
      <Voet />
    </>
  );
}
