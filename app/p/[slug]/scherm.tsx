"use client";
// Het openbare profiel. Zonder account te bekijken, alleen als de eigenaar het heeft opengezet.
import { useEffect, useState } from "react";
import { Kop, Voet } from "@/components/Kop";
import { ProfielView } from "@/components/Profiel";
import { getStore } from "@/lib/store";
import type { PubliekProfiel } from "@/lib/types";

export function Publiek({ slug }: { slug: string }) {
  const [p, setP] = useState<PubliekProfiel | null | undefined>(undefined);
  useEffect(() => {
    getStore().publiekProfiel(slug).then(setP, () => setP(null));
  }, [slug]);
  return (
    <>
      <Kop nav={false} />
      <main className="wrap">
        {p === undefined ? <div style={{ minHeight: "50vh" }} aria-busy="true" /> : p === null ? (
          <div className="ph"><h1>Dit profiel is niet openbaar.</h1><p>Het bestaat niet, of de eigenaar heeft het niet opengezet.</p></div>
        ) : (
          <ProfielView naam={p.profiel.naam} rol={p.profiel.rol} agency={p.profiel.agency} zin={p.zin} verschuiving={p.verschuiving} kaarten={p.profiel.toon.exps ? p.kaarten : undefined} alleenLezen />
        )}
      </main>
      <Voet />
    </>
  );
}
