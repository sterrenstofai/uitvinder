"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app";
import { Cover } from "@/components/Cover";
import { Kaart } from "@/components/Kaart";
import { TOOLS } from "@/lib/tools";
import type { Exp } from "@/lib/types";

// Library: tools die het uitvoerende werk doen, je eigen kaarten en die van je team.
export default function Library() {
  const { data, teamKaarten } = useApp();
  const [tab, setTab] = useState<"mijn" | "team">("mijn");
  const [team, setTeam] = useState<Exp[] | null>(null);
  useEffect(() => {
    if (new URLSearchParams(location.search).get("tab") === "team" && data.team) setTab("team");
    if (data.team) teamKaarten().then(setTeam, () => setTeam([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.team?.id]);
  const mijn = data.exps.slice().reverse();
  const lijst = tab === "mijn" ? mijn : team || [];
  return (
    <main className="wrap wide">
      <div className="ph">
        <div className="lbl">Library</div>
        <h1>Wat er gemaakt is.</h1>
        <p>Elke kaart heeft de spec erbij. Remix een kaart en je begint niet bij nul.</p>
      </div>
      <div className="grp"><span>Tools en tutorials</span><span>Doen het uitvoerende werk, jij het oordeel</span></div>
      <div className="tools">
        {TOOLS.map((t) => (
          <Link key={t.id} className="tool" href={`/tool/${t.id}`}>
            <Cover seed={t.seed} w={600} h={340} cls="lg" />
            <span className="tag">{t.type}, stap {t.stap.join(" en ")}</span>
            <div><h3>{t.titel}</h3><p>{t.kort}</p></div>
          </Link>
        ))}
      </div>
      <div className="grp"><span>Experimentkaarten</span></div>
      <div className="seg tabs" role="group" aria-label="Weergave">
        <button aria-pressed={tab === "mijn"} onClick={() => setTab("mijn")}>Mijn kaarten ({mijn.length})</button>
        {data.team && <button aria-pressed={tab === "team"} onClick={() => setTab("team")}>{data.team.naam} ({team?.length ?? 0})</button>}
      </div>
      <div style={{ marginTop: 14 }}>
        {lijst.length ? lijst.map((e) => <Kaart key={e.id} e={e} eigen={tab === "mijn"} />) : (
          <div className="empty">
            {tab === "mijn" ? "Nog geen kaarten. Rond een ronde af en hij komt hier." : "Nog geen kaarten van teamgenoten. Een kaart komt hier als iemand hem met het team deelt."}
            {tab === "mijn" && <div className="btns"><Link className="btn sm" href="/ronde/nieuw">Start een ronde</Link></div>}
          </div>
        )}
      </div>
    </main>
  );
}
