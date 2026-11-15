"use client";
// Tutorial: Meta Ads lezen met Claude in Chrome. Claude leest, jij kiest en verantwoordt.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app";
import { ToolUitleg } from "@/components/ToolUitleg";
import { CHROME_PROMPT } from "@/lib/tools";

export default function ChromeTutorial() {
  const { nieuwExp, toast } = useApp();
  const router = useRouter();
  const [f, setF] = useState({ klant: "", keuze: "", waarom: "", hyp: "" });
  const veld = (k: keyof typeof f) => ({ value: f[k], onChange: (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value }) });

  async function ronde() {
    // Toolcontract: zonder keuze en verantwoording wordt het geen ronde. De database dwingt dat ook af.
    if (!f.keuze.trim() || !f.waarom.trim()) return toast("Vul in wat je kiest en waarom");
    try {
      const e = await nieuwExp({ klant: f.klant, signaal: f.keuze, keuze: f.waarom, hypothese: f.hyp.includes("...") ? "" : f.hyp, tool: "Claude in Chrome, Meta Ads", bron_tool: "chrome" });
      toast("Ronde gestart");
      router.push(`/ronde/${e.id}`);
    } catch { toast("Een ronde starten lukte niet."); }
  }

  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Library, tutorial</div>
        <h1>Meta Ads lezen met Claude in Chrome.</h1>
        <p>Claude leest Ads Manager in je eigen browser, met de actuele cijfers. Geen export, geen koppeling die Meta moet goedkeuren. Claude laat zien wat opvalt, jij kiest wat je test.</p>
      </div>
      <ToolUitleg id="chrome" />
      <section className="step">
        <div className="step-h"><b>1</b><h2>Voor je begint</h2></div>
        <div className="step-b">
          <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6, lineHeight: 1.5 }}>
            <li>Je hebt Claude in Chrome nodig, en toegang tot het advertentieaccount van de klant.</li>
            <li>Claude werkt in jouw ingelogde sessie. Kijk mee terwijl hij leest, en stop hem als hij iets wil aanpassen.</li>
            <li>Werk je voor een klant, check dan of die akkoord is dat een AI-assistent meekijkt in het account.</li>
          </ul>
        </div>
      </section>
      <section className="step">
        <div className="step-h"><b>2</b><h2>Zo doe je het</h2></div>
        <div className="step-b">
          <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6, lineHeight: 1.5 }}>
            <li>Open Ads Manager in Chrome. Kies het account, het niveau Advertenties en een periode van minstens 14 dagen.</li>
            <li>Zet de kolommen besteed bedrag, weergaven, CTR, kosten per resultaat en frequentie aan.</li>
            <li>Open Claude in Chrome en plak de prompt hieronder.</li>
            <li>Lees de punten die Claude noemt. Kies er één en vul hieronder in waarom.</li>
          </ol>
          <div className="f" style={{ marginTop: 18 }}><span>De prompt</span><pre>{CHROME_PROMPT}</pre></div>
          <div className="btns"><button className="btn ghost sm" onClick={() => navigator.clipboard.writeText(CHROME_PROMPT).then(() => toast("Prompt gekopieerd"), () => toast("Kopiëren lukte niet"))}>Kopieer prompt</button></div>
        </div>
      </section>
      <section className="step">
        <div className="step-h"><b>3</b><h2>Jouw oordeel</h2><span>Hier word je uitvinder</span></div>
        <div className="step-b">
          <label className="f"><span>Voor welke klant?</span><input type="text" {...veld("klant")} /></label>
          <label className="f"><span>Welk punt kies je?</span><small>Plak het punt van Claude, met het bewijs.</small><textarea {...veld("keuze")} /></label>
          <label className="f"><span>Waarom dit punt, en niet een ander?</span><textarea {...veld("waarom")} /></label>
          <label className="f"><span>Je hypothese</span><textarea {...veld("hyp")} placeholder="Als ik ..., dan verwacht ik ..., omdat ..." /></label>
          <div className="btns"><button className="btn" onClick={ronde}>Maak er een ronde van</button></div>
        </div>
      </section>
    </main>
  );
}
