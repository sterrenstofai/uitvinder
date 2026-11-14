"use client";
import { useEffect, useState } from "react";
import { isRol, leesPrototype, useApp } from "@/components/app";
import { ROLLEN, type Rol } from "@/lib/types";

export default function Start() {
  const { bewaarProfiel, neemPrototypeOver, toast } = useApp();
  const [naam, setNaam] = useState("");
  const [rol, setRol] = useState<Rol>("designer");
  const [ondernemer, setOndernemer] = useState<boolean | null>(null);
  const [oud, setOud] = useState(false);
  const [neemOver, setNeemOver] = useState(true);
  const [bezig, setBezig] = useState(false);

  useEffect(() => {
    const S = leesPrototype();
    if (!S) return;
    setOud(true);
    setNaam(S.user.naam || "");
    if (isRol(S.user.rol)) setRol(S.user.rol);
  }, []);

  async function verder(e: React.FormEvent) {
    e.preventDefault();
    if (!naam.trim()) return;
    if (ondernemer === null) return toast("Kies of je in een team werkt of als ondernemer");
    setBezig(true);
    try {
      if (oud && neemOver) {
        const n = await neemPrototypeOver();
        toast(`${n} ${n === 1 ? "ronde" : "rondes"} overgenomen uit het prototype`);
      }
      await bewaarProfiel(naam, rol, ondernemer);
    } catch {
      toast("Opslaan lukte niet. Probeer het opnieuw.");
      setBezig(false);
    }
  }

  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Welkom</div>
        <h1>Wie ben je?</h1>
      </div>
      <form onSubmit={verder}>
        <label className="f">
          <span>Je naam</span>
          <input type="text" required value={naam} onChange={(e) => setNaam(e.target.value)} autoComplete="name" />
        </label>
        <div className="f">
          <span>Je rol</span>
          <div className="seg" role="group" aria-label="Rol">
            {ROLLEN.map((r) => (
              <button type="button" key={r} aria-pressed={rol === r} onClick={() => setRol(r)}>{r}</button>
            ))}
          </div>
        </div>
        <div className="f">
          <span>Hoe werk je?</span>
          <small>Als ondernemer krijg je er hulp bij je administratie bij. Je kunt dit later aanpassen.</small>
          <div className="seg" role="group" aria-label="Hoe werk je?">
            <button type="button" aria-pressed={ondernemer === false} onClick={() => setOndernemer(false)}>In een team</button>
            <button type="button" aria-pressed={ondernemer === true} onClick={() => setOndernemer(true)}>Als ondernemer</button>
          </div>
        </div>
        {oud && (
          <label className="f" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <input type="checkbox" checked={neemOver} onChange={(e) => setNeemOver(e.target.checked)} style={{ width: "auto", marginTop: 4 }} />
            <span>
              Neem mijn gegevens uit het prototype over
              <small>Je Rolscan, je invalshoek en je rondes van dit apparaat komen in je account.</small>
            </span>
          </label>
        )}
        <div className="btns" style={{ marginTop: 18 }}>
          <button className="btn" disabled={bezig}>{bezig ? "Bezig…" : "Ga verder"}</button>
        </div>
      </form>
    </main>
  );
}
