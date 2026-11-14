// Zachte lichtverlopen, zelfde berekening als het prototype.
const PAL = [
  ["#ff8a5c", "#ffc4a3", "#f59ac0", "#f6e6da"], ["#a98bff", "#f59ac0", "#ffd2bd", "#f1eaf7"], ["#8ab8ff", "#c3b2ff", "#ffe0cc", "#eef0f8"],
  ["#ff8a5c", "#ffb07a", "#ffe3a6", "#f8ece0"], ["#7fcfb0", "#8ab8ff", "#f3e0cc", "#ecf3ef"], ["#f59ac0", "#ffb38a", "#c3b2ff", "#f8eaef"],
];
const hsh = (t: string) => {
  let h = 2166136261;
  for (const c of String(t)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
};
const f = (n: number) => Number(n.toFixed(2));

export function Cover({ seed, w = 320, h = 200, cls }: { seed: string; w?: number; h?: number; cls?: string }) {
  const n = hsh(seed), [c1, c2, c3, base] = PAL[n % PAL.length], id = "g" + n.toString(36) + w;
  const r = (k: number) => ((n >>> k) & 255) / 255;
  const D = Math.max(w, h);
  return (
    <svg className={cls} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={f(D / 9)} />
        </filter>
      </defs>
      <rect width={w} height={h} fill={base} />
      <g filter={`url(#${id})`}>
        <circle cx={f(w * (0.15 + r(3) * 0.3))} cy={f(h * (0.85 + r(5) * 0.3))} r={f(D * 0.42)} fill={c1} />
        <circle cx={f(w * (0.6 + r(9) * 0.3))} cy={f(h * (0.2 + r(13) * 0.4))} r={f(D * 0.34)} fill={c2} />
        <circle cx={f(w * (0.45 + r(17) * 0.2))} cy={f(h * (0.45 + r(21) * 0.2))} r={f(D * 0.2)} fill={c3} opacity=".85" />
        <ellipse cx={f(w * 0.5)} cy={f(-h * 0.05)} rx={f(w * 0.5)} ry={f(h * 0.28)} fill="#fff" opacity=".7" />
      </g>
    </svg>
  );
}
