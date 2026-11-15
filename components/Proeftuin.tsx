"use client";
// Proeftuinen bij stap 3, 4 en 5. Oefenstaat, niet bewaard: zelfde werking als het prototype.
import { useState, type ReactNode } from "react";
import { useApp } from "./app";
import { CASES, GEDRAG, GEHEIM, LADDER, TOETS, TOETS_NEE, VAAG, WAT, ZINNEN } from "@/lib/proeftuin";
import type { Exp } from "@/lib/types";

function Oef({ titel, sub, children }: { titel: string; sub: string; children: ReactNode }) {
  return (
    <details className="oef">
      <summary>
        <span className="pt" aria-hidden="true">✦</span>
        <span>Proeftuin: {titel}<small>{sub}</small></span>
      </summary>
      <div className="lb">{children}</div>
    </details>
  );
}
const Chks = ({ items }: { items: [boolean, string][] }) => (
  <div className="chks">{items.map(([y, t]) => <span key={t} className={y ? "y" : ""}>{t}</span>)}</div>
);
type Neem = (patch: Partial<Exp>) => void;

export function Proeftuin3({ e }: { e: Exp }) {
  const [i, setI] = useState(0);
  const [ant, setAnt] = useState<string[]>([]);
  const [eig, setEig] = useState<(string | null)[]>([null, null, null]);
  const c = CASES[i], a = ant[i];
  const sc = CASES.filter((x, j) => ant[j] === x.ok).length;
  const all = eig.every((x) => x === "ja"), miss = eig.findIndex((x) => x === "nee");
  return (
    <Oef titel="Signaal of ruis?" sub="Oefen met zes voorbeelden, toets daarna je eigen signaal">
      {i < CASES.length ? (
        <div className="case">
          <div className="prog">{CASES.map((_, j) => <i key={j} className={j <= i ? "on" : ""}></i>)}</div>
          <div className="cm">{c.merk}, voorbeeld {i + 1} van {CASES.length} (bedachte situatie)</div>
          <div className="cs">{c.sig}</div>
          {a ? (
            <>
              <div className={`fb ${a === c.ok ? "ok" : "no"}`}><b>{a === c.ok ? "Goed." : "Niet helemaal."}</b> Dit is {c.ok}. {c.uit}</div>
              <div className="btns" style={{ marginTop: 12 }}>
                <button className="btn sm" onClick={() => setI(i + 1)}>{i + 1 < CASES.length ? "Volgende" : "Bekijk je score"}</button>
              </div>
            </>
          ) : (
            <div className="btns">
              {(["signaal", "ruis"] as const).map((v) => (
                <button key={v} className={`btn sm ${v === "ruis" ? "ghost" : ""}`} onClick={() => setAnt(Object.assign([...ant], { [i]: v }))}>
                  {v === "signaal" ? "Signaal" : "Ruis"}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="case">
          <div className="cs">{sc} van {CASES.length} goed.</div>
          <p className="hint">{sc === CASES.length ? "Je ziet het verschil. Toets nu je eigen signaal." : "Kijk bij de fouten welke van de drie vragen je oversloeg."}</p>
          <div className="btns" style={{ marginTop: 12 }}><button className="btn ghost sm" onClick={() => { setI(0); setAnt([]); }}>Opnieuw</button></div>
        </div>
      )}
      <h4>Toets je eigen signaal</h4>
      <div className="rolx"><b>Jouw signaal</b>{e.signaal || "Vul eerst hieronder je signaal in."}</div>
      <div>
        {TOETS.map((q, j) => (
          <div key={q} className="qrow">
            <span>{q}</span>
            <span className="minis">
              {["ja", "nee"].map((v) => (
                <button key={v} aria-pressed={eig[j] === v} onClick={() => setEig(Object.assign([...eig], { [j]: v }))}>{v}</button>
              ))}
            </span>
          </div>
        ))}
      </div>
      {eig.every((x) => x) && (
        <div className={`fb ${all ? "ok" : "no"}`}>{all ? "Drie keer ja. Dit is je signaal." : `Vraag ${miss + 1} is nee. ${TOETS_NEE[miss]}`}</div>
      )}
    </Oef>
  );
}

export function Proeftuin4({ e, neem }: { e: Exp; neem: Neem }) {
  const { toast } = useApp();
  const [q, setQ] = useState<(number | null)[]>([null, null, null]);
  const [f, setF] = useState<Record<string, string>>({});
  const [lad, setLad] = useState<number | null>(null);
  const zet = (k: string) => (ev: { target: { value: string } }) => setF({ ...f, [k]: ev.target.value });
  const gedrag = f.gedrag && f.gedrag !== "anders" ? f.gedrag : f.gedrag2 || "";
  const zin = `Als ik ${f.maak || "[wat je maakt]"} maak voor ${f.wie || "[wie]"}, dan verwacht ik ${f.getal || "[getal]"} ${gedrag || "[gedrag]"}, omdat ${f.omdat || "[je aanname]"}.`;
  function neemOver() {
    if (!f.maak || !f.getal) return toast("Vul minstens in wat je maakt en het getal");
    neem({
      hypothese: zin,
      meting: `${f.getal} ${gedrag}`.trim(),
      ...(e.bouw ? {} : { bouw: (lad !== null ? LADDER[lad] + ": " : "") + f.maak }),
    });
    toast("Overgenomen in je ronde");
  }
  return (
    <Oef titel="Hypothesebouwer" sub="Wat ontbreekt er? Bouw daarna je eigen hypothese">
      <h4>Wat ontbreekt er?</h4>
      {WAT.map((w, j) => (
        <div key={w.h} className="case" style={{ marginTop: 8 }}>
          <div className="cs" style={{ fontSize: "1.02rem" }}>{w.h}</div>
          <div className="minis" style={{ flexWrap: "wrap" }}>
            {w.opt.map((o, k) => <button key={o} aria-pressed={q[j] === k} onClick={() => setQ(Object.assign([...q], { [j]: k }))}>{o}</button>)}
          </div>
          {q[j] !== null && <div className={`fb ${q[j] === w.ok ? "ok" : "no"}`}><b>{q[j] === w.ok ? "Goed." : "Niet helemaal."}</b> {w.uit}</div>}
        </div>
      ))}
      <h4>Bouw je hypothese</h4>
      <label className="f"><span>Wat maak je?</span><input type="text" value={f.maak || ""} onChange={zet("maak")} placeholder="een koelcheck" /></label>
      <label className="f"><span>Voor wie?</span><input type="text" value={f.wie || ""} onChange={zet("wie")} placeholder="mensen die tijdens een hittegolf een airco zoeken" /></label>
      <div className="f">
        <span>Wat doen mensen, en hoeveel?</span>
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 8 }}>
          <input type="text" value={f.getal || ""} onChange={zet("getal")} placeholder="200" inputMode="numeric" aria-label="Getal" />
          <select value={f.gedrag || ""} onChange={zet("gedrag")} aria-label="Gedrag">
            <option value="">Kies gedrag</option>
            {GEDRAG.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        {f.gedrag === "anders" && <input type="text" value={f.gedrag2 || ""} onChange={zet("gedrag2")} placeholder="Beschrijf het gedrag" style={{ marginTop: 8 }} />}
      </div>
      <label className="f"><span>Omdat</span><input type="text" value={f.omdat || ""} onChange={zet("omdat")} placeholder="mensen iets bruikbaars eerder delen dan iets om te lezen" /></label>
      <div className="f">
        <span>Wat bouw je?</span>
        <div className="seg">{LADDER.map((l, k) => <button key={l} aria-pressed={lad === k} onClick={() => setLad(k)}>{l}</button>)}</div>
      </div>
      <div className="prev">{zin}</div>
      <Chks items={[
        [!!(f.getal && /\d/.test(f.getal)), "Er staat een getal in"],
        [!!gedrag, "Je meet gedrag"],
        [!!f.wie, "Je weet voor wie"],
        [lad !== null, "Het past op de ladder, dus in een middag"],
        [!!f.omdat, "Je aanname staat erbij"],
      ]} />
      <div className="btns"><button className="btn sm" onClick={neemOver}>Neem over in je ronde</button></div>
    </Oef>
  );
}

export function Proeftuin5({ e, neem }: { e: Exp; neem: Neem }) {
  const { toast } = useApp();
  const [f, setF] = useState<Record<string, string>>({});
  const zet = (k: string) => (ev: { target: { value: string } }) => setF({ ...f, [k]: ev.target.value });
  const bouw = f.bouw ?? e.bouw.replace(/\.$/, "");
  const link = f.link ?? e.link;
  const post = `${f.getal || "[getal]"}${f.vergelijk ? ". " + f.vergelijk : ""}.\n${bouw || "[wat je zag en bouwde]"}.\nWat ik leerde: ik dacht ${f.dacht || "..."}, het bleek ${f.bleek || "..."}.${link ? "\n" + link : ""}`;
  function neemOver() {
    if (!f.getal) return toast("Vul eerst de uitkomst in");
    neem({
      uitkomst: f.getal + (f.vergelijk ? ". " + f.vergelijk : "") + ".",
      ...(f.dacht && f.bleek ? { geleerd: `Ik dacht ${f.dacht}, het bleek ${f.bleek}.` } : {}),
    });
    toast("Overgenomen in je ronde");
  }
  return (
    <Oef titel="Postmaker" sub="Maak van je kaart een post voor je team of LinkedIn">
      <p className="hint">Een post in vier stappen: begin met het getal, vertel wat je zag en bouwde, wat je leerde, en de link.</p>
      <label className="f"><span>De uitkomst, als getal</span><input type="text" value={f.getal || ""} onChange={zet("getal")} placeholder="412 keer gedeeld in vijf dagen" /></label>
      <label className="f"><span>Vergelijk het met</span><input type="text" value={f.vergelijk || ""} onChange={zet("vergelijk")} placeholder="Onze best gedeelde post van de maand kwam op 37" /></label>
      <label className="f"><span>Wat je zag en bouwde</span><input type="text" value={bouw} onChange={zet("bouw")} placeholder="Bij de eerste hittegolf bouwde ik een koelcheck" /></label>
      <label className="f"><span>Ik dacht</span><input type="text" value={f.dacht || ""} onChange={zet("dacht")} placeholder="dat mensen hem zouden lezen" /></label>
      <label className="f"><span>Het bleek</span><input type="text" value={f.bleek || ""} onChange={zet("bleek")} placeholder="dat ze hem vooral doorstuurden" /></label>
      <label className="f"><span>Link (optioneel)</span><input type="url" value={link} onChange={zet("link")} placeholder="https://" /></label>
      <div className="prev" style={{ whiteSpace: "pre-wrap" }}>{post}</div>
      <Chks items={[
        [/\d/.test(f.getal || ""), "De uitkomst is een getal"],
        [!!(f.dacht && f.bleek), "Je schreef op wat je dacht en wat bleek"],
        [!!bouw, "Je vertelt wat je bouwde"],
        [!GEHEIM.test(post), "Geen vertrouwelijke cijfers van de klant"],
      ]} />
      <div className="btns">
        <button className="btn ghost sm" onClick={() => navigator.clipboard.writeText(post).then(() => toast("Post gekopieerd"), () => toast("Kopiëren lukte niet"))}>Kopieer post</button>
        <button className="btn sm" onClick={neemOver}>Neem over in je ronde</button>
      </div>
    </Oef>
  );
}

// Proeftuin bij stap 2: herken een eigen invalshoek, schrijf daarna de jouwe.
export function Proeftuin2({ start, neem }: { start: { zin: string; voorwie: string }; neem: (v: { zin: string; voorwie?: string; buiten?: string }) => void }) {
  const { toast } = useApp();
  const [i, setI] = useState(0);
  const [ant, setAnt] = useState<string[]>([]);
  const [f, setF] = useState<Record<string, string>>({ zin: start.zin, wie: start.voorwie });
  const zet = (k: string) => (ev: { target: { value: string } }) => setF({ ...f, [k]: ev.target.value });
  const c = ZINNEN[i], a = ant[i];
  const sc = ZINNEN.filter((x, j) => ant[j] === x.ok).length;
  const z = (f.zin || "").trim(), w = (z.match(/\S+/g) || []).length;
  function neemOver() {
    if (!z) return toast("Schrijf eerst je zin");
    const buiten = [f.werk, f.diep, f.advies].filter(Boolean).join("; ");
    neem({ zin: z, ...(f.wie ? { voorwie: f.wie } : {}), ...(buiten ? { buiten } : {}) });
    toast("Overgenomen, leg hem vast onderaan");
  }
  return (
    <Oef titel="Eigen of inwisselbaar?" sub="Herken een eigen invalshoek, schrijf daarna de jouwe">
      {i < ZINNEN.length ? (
        <div className="case">
          <div className="prog">{ZINNEN.map((_, j) => <i key={j} className={j <= i ? "on" : ""}></i>)}</div>
          <div className="cm">Voorbeeld {i + 1} van {ZINNEN.length}: eigen of inwisselbaar?</div>
          <div className="cs">{c.z}</div>
          {a ? (
            <>
              <div className={`fb ${a === c.ok ? "ok" : "no"}`}><b>{a === c.ok ? "Goed." : "Niet helemaal."}</b> Deze is {c.ok}. {c.uit}</div>
              <div className="btns" style={{ marginTop: 12 }}><button className="btn sm" onClick={() => setI(i + 1)}>{i + 1 < ZINNEN.length ? "Volgende" : "Bekijk je score"}</button></div>
            </>
          ) : (
            <div className="btns">
              <button className="btn sm" onClick={() => setAnt(Object.assign([...ant], { [i]: "eigen" }))}>Eigen</button>
              <button className="btn ghost sm" onClick={() => setAnt(Object.assign([...ant], { [i]: "inwisselbaar" }))}>Inwisselbaar</button>
            </div>
          )}
        </div>
      ) : (
        <div className="case">
          <div className="cs">{sc} van {ZINNEN.length} goed.</div>
          <p className="hint">Een eigen zin is concreet, waar en niet door een collega over te nemen.</p>
          <div className="btns" style={{ marginTop: 12 }}><button className="btn ghost sm" onClick={() => { setI(0); setAnt([]); }}>Opnieuw</button></div>
        </div>
      )}
      <h4>Zoek je combinatie</h4>
      <label className="f"><span>Waar heb je gewerkt buiten dit vak?</span><small>Ook bijbaantjes en zijpaden tellen.</small><input type="text" value={f.werk || ""} onChange={zet("werk")} placeholder="vier jaar in de horeca" /></label>
      <label className="f"><span>Waar zit je diep in buiten je werk?</span><input type="text" value={f.diep || ""} onChange={zet("diep")} placeholder="wielrennen, ik rijd al tien jaar competitie" /></label>
      <label className="f"><span>Waar vragen mensen jou om advies, los van je werk?</span><input type="text" value={f.advies || ""} onChange={zet("advies")} placeholder="hoe je een verbouwing plant" /></label>
      <label className="f"><span>Voor wie wil je relevant zijn?</span><input type="text" value={f.wie || ""} onChange={zet("wie")} placeholder="familiebedrijven in de regio" /></label>
      <p className="hint">Kies één van je antwoorden en schrijf je zin in deze vorm: Ik [wat je doet] voor [wie], omdat ik [iets van buiten je vak].</p>
      <label className="f" style={{ marginTop: 12 }}><span>Jouw zin</span><textarea value={f.zin || ""} onChange={zet("zin")} placeholder="Ik ... voor ..., omdat ik ..." /></label>
      <Chks items={[
        [!!z && w <= 25, `Hooguit 25 woorden (nu ${w})`],
        [/\bvoor\b/i.test(z), "Er staat in voor wie"],
        [/\bomdat\b/i.test(z), "Er staat in wat je van buiten je vak meeneemt"],
        [!!z && !VAAG.test(z), "Geen vage woorden zoals creatief, passie of innovatief"],
        [!!z && !/^\s*ik ben (een )?/i.test(z), "Begint niet met een functietitel"],
      ]} />
      <div className="btns"><button className="btn sm" onClick={neemOver}>Neem over als je invalshoek</button></div>
    </Oef>
  );
}
