"use client";
// Team. De eigenaar ziet per persoon alleen de verhouding uitvoerend en uitvindend,
// en de kaarten die met het team gedeeld zijn. Nooit antwoorden, invalshoek of privékaarten.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app";
import type { Lid } from "@/lib/types";

const KLEUR = ["#ff8a5c", "#a98bff", "#8ab8ff", "#7fcfb0", "#f59ac0", "#f2c14e"];
const ROLNAAM: Record<string, string> = { eigenaar: "Eigenaar", lid: "Lid", beoordelaar: "Beoordelaar" };

export default function TeamPagina() {
  const { data, modus, sessie, maakTeam, teamLeden, voegLidToe, verwijderLid, teamKaarten, toast } = useApp();
  const team = data.team;
  const [leden, setLeden] = useState<Lid[] | null>(null);
  const [gedeeld, setGedeeld] = useState(0);
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<"lid" | "beoordelaar">("lid");
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState("");

  const laad = () => teamLeden().then(setLeden, () => setLeden([]));
  useEffect(() => {
    if (!team) return;
    laad();
    teamKaarten().then((k) => setGedeeld(k.length + data.exps.filter((e) => e.zichtbaarheid === "team" && e.team_id === team.id).length), () => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team?.id]);

  if (modus === "lokaal")
    return (
      <main className="wrap">
        <div className="ph"><div className="lbl">Team</div><h1>Een team vraagt echte accounts.</h1><p>In voorbeeldmodus blijven je gegevens op dit apparaat, dus er is niemand om mee te delen.</p></div>
      </main>
    );

  if (!team)
    return (
      <main className="wrap">
        <div className="ph">
          <div className="lbl">Team</div>
          <h1>Maak een team.</h1>
          <p>Als eigenaar zie je per persoon alleen de verhouding uitvoerend en uitvindend, en de kaarten die met het team gedeeld zijn. Rolscan-antwoorden, invalshoeken en privékaarten zie je niet.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (!naam.trim()) return; setBezig(true); maakTeam(naam).then(() => toast("Team gemaakt"), () => toast("Dat lukte niet.")).finally(() => setBezig(false)); }}>
          <label className="f"><span>Naam van het team of de agency</span><input type="text" required value={naam} onChange={(e) => setNaam(e.target.value)} /></label>
          <div className="btns" style={{ marginTop: 16 }}><button className="btn" disabled={bezig}>Maak team</button></div>
        </form>
        <p className="hint" style={{ marginTop: 16 }}>Ben je uitgenodigd voor een team, dan verschijnt het hier zodra de eigenaar je heeft toegevoegd.</p>
      </main>
    );

  const eigenaar = team.mijnRol === "eigenaar";
  const metCijfer = (leden || []).filter((m) => m.nul !== null && m.nu !== null);
  const gem = (k: "nul" | "nu") => (metCijfer.length ? Math.round(metCijfer.reduce((a, m) => a + (m[k] as number), 0) / metCijfer.length) : null);

  async function nodigUit(e: React.FormEvent) {
    e.preventDefault();
    setMelding(""); setBezig(true);
    try {
      const r = await voegLidToe(email, rol);
      if (r === "ok") { setEmail(""); toast("Toegevoegd aan het team"); await laad(); }
      else if (r === "geen_account") setMelding("Dit adres heeft nog geen account. Vraag diegene eerst in te loggen op het platform en voeg hem daarna toe.");
      else if (r === "al_lid") setMelding("Deze persoon zit al in het team.");
    } catch { setMelding("Toevoegen lukte niet. Is de derde migratie uitgevoerd?"); }
    setBezig(false);
  }
  async function verwijder(m: Lid) {
    if (!confirm(`${m.naam} uit het team halen?`)) return;
    try { await verwijderLid(m.user_id); await laad(); } catch { toast("Dat lukte niet."); }
  }

  return (
    <main className="wrap wide">
      <div className="ph">
        <div className="lbl">Team{eigenaar ? ", weergave voor de eigenaar" : ""}</div>
        <h1>{team.naam}</h1>
        <p>{eigenaar
          ? "Zo verschuift je team van uitvoerend naar uitvindend. Je ziet geen rolscan-antwoorden, invalshoek-twijfels of privékaarten. Alleen de verhouding en wat met het team is gedeeld."
          : "Je team. De eigenaar ziet van jou alleen je percentage uitvindend en de kaarten die je met het team deelt."}</p>
      </div>
      {eigenaar && (
        <div className="cmp">
          <div><span>Team bij de start</span><b>{gem("nul") ?? "–"}%</b><span>uitvinder</span></div>
          <div><span>Team nu</span><b>{gem("nu") ?? "–"}%</b><span>uitvinder</span></div>
        </div>
      )}
      <div className="grp"><span>{eigenaar ? "Per persoon" : "Leden"}</span><span>{eigenaar ? "Start → nu" : `${leden?.length ?? 0}`}</span></div>
      {leden === null ? <div className="empty" aria-busy="true">Laden…</div> : (
        <div className="tmw">
          {leden.map((m, i) => (
            <div key={m.user_id} className="tm">
              <span className="nm"><span className="dot" style={{ background: KLEUR[i % KLEUR.length] }}></span>{m.naam}{m.user_id === sessie?.id ? " (jij)" : ""}<small>{[m.rol, ROLNAAM[m.teamrol]].filter(Boolean).join(", ")}</small></span>
              {eigenaar && m.nul !== null && m.nu !== null ? (
                <>
                  <span className="shift" aria-label={`Van ${Math.round(m.nul)} naar ${Math.round(m.nu)} procent`}><i style={{ width: `${m.nu}%` }}></i><u style={{ left: `${m.nul}%` }}></u></span>
                  <span className="pc">{Math.round(m.nul)}% → {Math.round(m.nu)}%</span>
                </>
              ) : (
                <>
                  <span className="hint">{eigenaar ? "Nog geen Rolscan" : ""}</span>
                  <span className="pc">{eigenaar && m.teamrol !== "eigenaar" ? <button className="lnk" onClick={() => verwijder(m)}>Verwijder</button> : ""}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {eigenaar && <p className="hint" style={{ marginTop: 10 }}>Het streepje is de nulmeting, de balk de laatste meting.</p>}

      {eigenaar && (
        <>
          <div className="grp"><span>Iemand toevoegen</span></div>
          <form className="paneel" onSubmit={nodigUit}>
            <label className="f" style={{ marginTop: 0 }}><span>E-mailadres</span><small>Diegene moet al een keer ingelogd zijn op het platform.</small><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <div className="f"><span>Rol in het team</span><div className="seg"><button type="button" aria-pressed={rol === "lid"} onClick={() => setRol("lid")}>Lid</button><button type="button" aria-pressed={rol === "beoordelaar"} onClick={() => setRol("beoordelaar")}>Beoordelaar</button></div></div>
            {melding && <p className="err" role="alert" style={{ marginTop: 12 }}>{melding}</p>}
            <div className="btns" style={{ marginTop: 14 }}><button className="btn" disabled={bezig}>Voeg toe</button></div>
            <p className="hint" style={{ marginTop: 12 }}>Een beoordelaar ziet van teamleden het ingediende portfolio, de metingen en de eindopdracht.</p>
          </form>
        </>
      )}

      <div className="grp"><span>Gedeelde kaarten</span><span>{gedeeld}</span></div>
      <div className="btns" style={{ marginTop: 14 }}><Link className="btn ghost sm" href="/library?tab=team">Bekijk de gedeelde library</Link></div>
    </main>
  );
}
