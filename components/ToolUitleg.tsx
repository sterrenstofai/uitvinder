import { EISEN, TOOLS } from "@/lib/tools";

// "Zo werkt deze tool": elke tool is open over wat hij doet en hoe hij aan de zes eisen voldoet.
export function ToolUitleg({ id }: { id: string }) {
  const t = TOOLS.find((x) => x.id === id);
  if (!t) return null;
  return (
    <details className="les">
      <summary><span className="pt" aria-hidden="true">✓</span><span>Zo werkt deze {t.type.toLowerCase()}<small>{t.lu.join(" en ")}, en hoe hij aan de zes eisen voldoet</small></span></summary>
      <div className="lb">
        <ul>{t.werking.map((w) => <li key={w}>{w}</li>)}</ul>
        <h4>De zes eisen uit het kader</h4>
        <div className="eisen">{EISEN.map((e, i) => <div key={e}><span><b>{e}.</b> {t.eisen[i]}</span></div>)}</div>
      </div>
    </details>
  );
}
