import { Cover } from "./Cover";
import { Kaart } from "./Kaart";
import { initials } from "@/lib/afgeleid";
import type { Exp } from "@/lib/types";

// Verschuiving in de tijd: het percentage uitvindend per Rolscan.
export function Spark({ waarden }: { waarden: number[] }) {
  if (!waarden.length) return null;
  const w = 600, h = 230, p = 40, vals = waarden.map((v) => Math.round(v));
  const x = (i: number) => (vals.length === 1 ? w / 2 : p + (i * (w - 2 * p)) / (vals.length - 1)), y = (v: number) => h - p - (v / 100) * (h - 2 * p);
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Verschuiving: ${vals.join(", ")} procent uitvinder`}>
      <line x1={p} x2={w - p} y1={y(50)} y2={y(50)} stroke="currentColor" strokeOpacity=".25" strokeDasharray="4 5" />
      <polyline points={vals.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="3" />
      {vals.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r="12" fill="var(--acc)" stroke="currentColor" strokeWidth="2.5" />
          <text x={x(i)} y={y(v) - 24} textAnchor={i === 0 && vals.length > 1 ? "start" : i === vals.length - 1 && vals.length > 1 ? "end" : "middle"} fill="currentColor" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="26">{v}%</text>
        </g>
      ))}
    </svg>
  );
}

export function ProfielView({ naam, rol, agency, zin, verschuiving, kaarten, alleenLezen }: { naam: string; rol: string; agency: string | null; zin?: string; verschuiving?: number[]; kaarten?: Exp[]; alleenLezen?: boolean }) {
  return (
    <>
      <div className="pcv"><Cover seed={"profiel" + naam} w={960} h={300} /></div>
      <div className="prof">
        <div className="av">{initials(naam)}</div>
        <div><h1>{naam}</h1><p>{rol}{agency ? `, ${agency}` : ""}</p></div>
      </div>
      {zin && <div className="quote"><small>Invalshoek</small>{zin}</div>}
      {verschuiving && verschuiving.length > 0 && (
        <>
          <div className="grp"><span>Verschuiving</span><span>% uitvinder</span></div>
          <Spark waarden={verschuiving} />
        </>
      )}
      {kaarten !== undefined && (
        <>
          <div className="grp"><span>Wat ik uitvond</span><span>{kaarten.length}</span></div>
          {kaarten.length ? kaarten.map((e) => <Kaart key={e.id} e={e} alleenLezen={alleenLezen} />) : <div className="empty" style={{ marginTop: 14 }}>Nog geen openbare kaarten.</div>}
        </>
      )}
    </>
  );
}
