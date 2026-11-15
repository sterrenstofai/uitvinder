"use client";
// Profiel: het bewijs dat je uitvinder bent. Standaard privé; openbaar maken is een bewuste keuze, per onderdeel.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app";
import { ProfielView } from "@/components/Profiel";
import { ROLLEN, type Toon } from "@/lib/types";

export default function Profiel() {
  const { data, setProfiel, logout } = useApp();
  const u = data.profile!;
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(location.origin), []);
  const pub = data.exps.filter((e) => e.zichtbaarheid === "publiek" && e.status === "af");
  const toon = (k: keyof Toon, aan: boolean) => setProfiel({ toon: { ...u.toon, [k]: aan } });
  return (
    <main className="wrap">
      <ProfielView naam={u.naam} rol={u.rol} agency={u.agency} zin={data.inv.zin} verschuiving={data.scans.map((s) => s.pct_uitvindend)} kaarten={pub} />
      <div className="grp"><span>Gegevens</span></div>
      <div style={{ marginTop: 16 }}>
        <label className="f"><span>Naam</span><input type="text" value={u.naam} onChange={(e) => setProfiel({ naam: e.target.value })} /></label>
        <div className="f"><span>Rol</span><div className="seg">{ROLLEN.map((x) => <button key={x} aria-pressed={u.rol === x} onClick={() => setProfiel({ rol: x })}>{x}</button>)}</div></div>
        <label className="f"><span>Agency of team</span><input type="text" value={u.agency || ""} onChange={(e) => setProfiel({ agency: e.target.value || null })} /></label>
        <div className="f">
          <span>Hoe werk je?</span>
          <div className="seg" role="group" aria-label="Hoe werk je?">
            <button aria-pressed={!u.ondernemer} onClick={() => setProfiel({ ondernemer: false })}>In een team</button>
            <button aria-pressed={u.ondernemer} onClick={() => setProfiel({ ondernemer: true })}>Als ondernemer</button>
          </div>
        </div>
      </div>
      <div className="grp"><span>Openbaar profiel</span><span>{u.publiek ? "Aan" : "Uit"}</span></div>
      <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
        <label className="afvink"><input type="checkbox" checked={u.publiek} onChange={(e) => setProfiel({ publiek: e.target.checked })} />Maak mijn profiel openbaar</label>
        <label className="afvink"><input type="checkbox" checked={u.toon.inv} onChange={(e) => toon("inv", e.target.checked)} />Toon mijn invalshoek</label>
        <label className="afvink"><input type="checkbox" checked={u.toon.shift} onChange={(e) => toon("shift", e.target.checked)} />Toon mijn verschuiving</label>
        <label className="afvink"><input type="checkbox" checked={u.toon.exps} onChange={(e) => toon("exps", e.target.checked)} />Toon kaarten die ik op ‘Iedereen’ zet</label>
      </div>
      <p className="hint" style={{ marginTop: 12 }}>
        {u.publiek ? <>Je link: {origin}/p/{u.slug}</> : "Je profiel is besloten. Niemand anders ziet het."} Je Rolscan-antwoorden blijven altijd privé; op een openbaar profiel staat alleen het percentage.
      </p>
      <div className="btns" style={{ marginTop: 14 }}>
        {u.publiek && u.slug && <Link className="btn ghost sm" href={`/p/${u.slug}`}>Bekijk zoals anderen het zien</Link>}
        <button className="btn ghost sm" onClick={() => logout().then(() => (location.href = "/"))}>Log uit</button>
      </div>
    </main>
  );
}
