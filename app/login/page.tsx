"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app";
import { Kop, Voet } from "@/components/Kop";

export default function Login() {
  const { klaar, sessie, modus, login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [bezig, setBezig] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);
  const [fout, setFout] = useState("");

  useEffect(() => {
    if (klaar && sessie) router.replace("/vandaag");
  }, [klaar, sessie, router]);

  async function verstuur(e: React.FormEvent) {
    e.preventDefault();
    setFout("");
    setBezig(true);
    try {
      const r = await login(email.trim());
      if (r.direct) router.replace("/vandaag");
      else setVerstuurd(true);
    } catch {
      setFout("Inloggen lukte niet. Controleer je e-mailadres en probeer het opnieuw.");
    }
    setBezig(false);
  }

  return (
    <>
      <Kop nav={false} />
      <main className="wrap">
        <div className="ph">
          <div className="lbl">Inloggen</div>
          <h1>{verstuurd ? "Kijk in je mail." : "Log in met je e-mailadres."}</h1>
          <p>
            {verstuurd
              ? `We stuurden een link naar ${email}. Klik erop en je bent binnen. Je kunt dit tabblad sluiten.`
              : "Je krijgt een link in je mail. Geen wachtwoord nodig."}
          </p>
        </div>
        {!verstuurd && (
          <form onSubmit={verstuur}>
            <label className="f">
              <span>E-mailadres</span>
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jij@agency.nl" />
            </label>
            {fout && <p className="err" role="alert">{fout}</p>}
            <div className="btns" style={{ marginTop: 18 }}>
              <button className="btn" disabled={bezig}>{bezig ? "Bezig…" : modus === "lokaal" ? "Ga verder" : "Stuur me een link"}</button>
            </div>
            {modus === "lokaal" && (
              <p className="hint" style={{ marginTop: 16 }}>
                Voorbeeldmodus: er is nog geen database gekoppeld. Je gaat direct verder en je gegevens blijven op dit apparaat.
              </p>
            )}
          </form>
        )}
      </main>
      <Voet />
    </>
  );
}
