"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cover } from "./Cover";
import { useApp } from "./app";
import { expTitel, fmtD } from "@/lib/afgeleid";
import type { Exp } from "@/lib/types";

const ZICHT = { prive: "Alleen ik", team: "Team", publiek: "Iedereen" };

export function Kaart({ e, eigen }: { e: Exp; eigen?: boolean }) {
  const { nieuwExp, toast, data } = useApp();
  const router = useRouter();
  const m = [e.auteur && !eigen ? e.auteur : "", e.klant, e.datum ? fmtD(e.datum) : ""].filter(Boolean).join(", ");
  async function remix() {
    const n = await nieuwExp({ bouw: e.bouw, tool: e.tool, spec: e.spec, remix_titel: expTitel(e), remix_auteur: e.auteur || data.profile?.naam || "" });
    toast("Remix gestart");
    router.push(`/ronde/${n.id}`);
  }
  const veld = (kop: string, tekst: string, extra?: React.ReactNode) =>
    tekst ? (
      <div>
        <span>{kop}</span>
        <p>{tekst}{extra}</p>
      </div>
    ) : null;
  return (
    <details className="card">
      <summary>
        <span className="th"><Cover seed={e.id + (e.titel || "")} /></span>
        <span className="t">{expTitel(e)}</span>
        <span className={`tag ${e.status === "af" ? "dk" : "ov"}`}>{e.status === "af" ? "Afgerond" : "Bezig"}</span>
        <span className="m">
          {m}
          {eigen && <> <span className="tag ov">{ZICHT[e.zichtbaarheid]}</span></>}
          {e.remix_titel && <> <span className="tag ov">Remix</span></>}
        </span>
      </summary>
      <div className="body">
        {veld("Signaal", e.signaal)}
        {veld("Hypothese", e.hypothese)}
        {veld("Waarom deze keuze", e.keuze)}
        {veld("Gebouwd", e.bouw, e.tool ? <> <span className="hint">({e.tool})</span></> : null)}
        {e.link && (
          <div>
            <span>Link</span>
            <p><a href={e.link} target="_blank" rel="noopener noreferrer">{e.link}</a></p>
          </div>
        )}
        {e.spec && (
          <div>
            <span>Spec</span>
            <pre>{e.spec}</pre>
          </div>
        )}
        {veld("Uitkomst", e.uitkomst)}
        {veld("Geleerd", e.geleerd)}
        <div className="btns">
          {eigen && <Link className="btn ghost sm" href={`/ronde/${e.id}`}>Open</Link>}
          <button className="btn sm" onClick={remix}>Remix</button>
        </div>
      </div>
    </details>
  );
}
