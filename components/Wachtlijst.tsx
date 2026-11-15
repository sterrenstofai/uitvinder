"use client";
import { useState } from "react";
import { getStore } from "@/lib/store";

export function Wachtlijst() {
  const [email, setEmail] = useState("");
  const [stand, setStand] = useState<"" | "bezig" | "klaar" | "fout">("");
  async function verstuur(e: React.FormEvent) {
    e.preventDefault();
    setStand("bezig");
    try {
      await getStore().wachtlijst(email.trim().toLowerCase());
      setStand("klaar");
    } catch {
      setStand("fout");
    }
  }
  if (stand === "klaar") return <p className="wl-ok" role="status">Je staat op de lijst. Je hoort het als het platform opengaat.</p>;
  return (
    <>
      <form className="wl" onSubmit={verstuur}>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jij@agency.nl" autoComplete="email" aria-label="E-mailadres" />
        <button className="btn ghost" disabled={stand === "bezig"}>{stand === "bezig" ? "Bezig…" : "Zet me op de lijst"}</button>
      </form>
      <p className="hint" style={{ marginTop: 12 }} role={stand === "fout" ? "alert" : undefined}>
        {stand === "fout" ? "Aanmelden lukte niet. Probeer het later opnieuw." : "Ik gebruik je adres alleen om je te laten weten wanneer het platform live is."}
      </p>
    </>
  );
}
