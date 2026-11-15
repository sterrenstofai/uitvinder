import { MEETWEKEN, werkgedrag } from "@/lib/toetsing";
import type { Meting } from "@/lib/types";

const nl = (n: number) => n.toLocaleString("nl-NL", { maximumFractionDigits: 1 });

export function MetingTabel({ metingen }: { metingen: Meting[] }) {
  if (!metingen.length) return <div className="empty">Nog geen metingen.</div>;
  const rij = (lab: string, f: (m: Meting) => string) => (
    <tr>
      <td>{lab}</td>
      {MEETWEKEN.map((w) => {
        const m = metingen.find((x) => x.week === w);
        return <td key={w}>{m ? f(m) : "–"}</td>;
      })}
    </tr>
  );
  return (
    <div className="scroll">
      <table className="mtab">
        <thead><tr><th></th>{MEETWEKEN.map((w) => <th key={w}>Week {w}</th>)}</tr></thead>
        <tbody>
          {rij("Innovatief werkgedrag (1–5)", (m) => nl(werkgedrag(m)))}
          {rij("Creatief zelfvertrouwen (1–5)", (m) => nl(m.scores.cse))}
          {rij("Uitvindend werk (Rolscan)", (m) => (m.pct_rolscan === null ? "–" : `${Math.round(m.pct_rolscan)}%`))}
        </tbody>
      </table>
    </div>
  );
}
