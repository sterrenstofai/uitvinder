"use client";
import { useState } from "react";
import { Cover } from "./Cover";
import { useApp } from "./app";
import type { Les } from "@/lib/lessen";

// De tekst komt uit content/*.md. De video volgt per les als veld in de content.
export function LesBox({ les }: { les: Les }) {
  const { data } = useApp();
  const rol = data.profile && les.rol[data.profile.rol] ? data.profile.rol : "designer";
  const voorbeeld = les.rol[rol] ? (
    <div className="rolx" style={{ marginBottom: 14 }}>
      <b>Voorbeeld voor een {rol}</b>
      <div dangerouslySetInnerHTML={{ __html: les.rol[rol] }} />
      {/Coolblue|Albert Heijn|HEMA|\bBol\b/.test(les.rol[rol]) && (
        <span className="hint" style={{ display: "block", marginTop: 6 }}>Het merk is een voorbeeld, de situatie is bedacht.</span>
      )}
    </div>
  ) : null;
  return (
    <details className="les">
      <summary>
        <span className="pl" aria-hidden="true"></span>
        <span>Les: {les.titel}<small>Video en {les.leestijd} minuten lezen</small></span>
      </summary>
      <div className="lb">
        <div className="vid">
          <Cover seed={"video" + les.titel} w={640} h={360} cls="lg" />
          <div><div className="pl"></div><b>Uitlegvideo volgt</b><div className="hint">Thijs legt {les.titel.toLowerCase()} uit</div></div>
        </div>
        <div className="md" dangerouslySetInnerHTML={{ __html: les.inleiding }} />
        {les.secties.map((s) => (
          <div key={s.kop}>
            {/* Het voorbeeld voor jouw rol staat direct voor de opdracht. */}
            {s.kop === "Opdracht" && voorbeeld}
            <h4>{s.kop}</h4>
            <div className="md" dangerouslySetInnerHTML={{ __html: s.html }} />
          </div>
        ))}
        {!les.secties.some((s) => s.kop === "Opdracht") && voorbeeld}
      </div>
    </details>
  );
}

// De coach denkt mee en schrijft niet voor. Zelfde endpoint als het prototype.
export function CoachBox({ stap, context }: { stap: string; context: () => string }) {
  const [vraag, setVraag] = useState("");
  const [uit, setUit] = useState("");
  const [bezig, setBezig] = useState(false);
  async function vraagCoach() {
    setBezig(true);
    setUit("");
    try {
      const r = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stap, context: context(), vraag: vraag.trim() }),
      });
      const d = await r.json().catch(() => ({ error: "Onverwacht antwoord." }));
      setUit(!r.ok || d.error ? d.error || "Er ging iets mis." : d.text);
    } catch {
      setUit("De coach reageert nu niet. Probeer het opnieuw.");
    }
    setBezig(false);
  }
  return (
    <div className="coach">
      <div className="hd">
        <span>Coach</span>
        <button className="btn ghost sm" onClick={vraagCoach} disabled={bezig}>{bezig ? "Denkt na…" : "Vraag de coach"}</button>
      </div>
      <div className="ask">
        <input type="text" value={vraag} onChange={(e) => setVraag(e.target.value)} placeholder="Optioneel: je eigen vraag" aria-label="Je eigen vraag aan de coach" />
      </div>
      <div className="out" aria-live="polite">{uit}</div>
    </div>
  );
}
