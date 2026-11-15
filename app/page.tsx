// De voorkant. Opbouw en tekst komen uit het prototype (functie landing); de
// sectie voor ondernemers is nieuw. Alles wat nog niet is overgezet, linkt naar het prototype.
import Link from "next/link";
import { Cover } from "@/components/Cover";
import { Kop, Voet } from "@/components/Kop";
import { Mens } from "@/components/Mens";
import { Wachtlijst } from "@/components/Wachtlijst";
import { PRIJZEN } from "@/lib/prijzen";

const PROTO = "/prototype/index.html";
const SCAN = `${PROTO}#/scan`;

const STAPPEN: [string, string, string][] = [
  ["1", "Rolscan.", "Zie in vijf minuten hoeveel van je werk uitvoerend is. Dat is je nulmeting."],
  ["2", "Jouw invalshoek.", "Wat combineer jij dat schaars is? Eén zin die niemand kan namaken."],
  ["3", "Relevantie zoeken.", "Elke week een signaal waar het merk van je klant iets over te zeggen heeft."],
  ["4", "Uitvinden.", "Eén experiment met een hypothese, gebouwd in een middag en gemeten."],
  ["5", "Zichtbaar maken.", "Deel wat je maakte, met je team of met iedereen."],
  ["AI", "Een coach bij elke stap.", "Denkt mee en vraagt door, maar schrijft niets voor je."],
];
const TOOLS = [
  { id: "meta", type: "Tool", titel: "Meta Ads-analyse", kort: "Upload een export en zie waar je advertenties lekken en waar kansen liggen.", seed: "tool-meta-1" },
  { id: "chrome", type: "Tutorial", titel: "Meta Ads lezen met Claude in Chrome", kort: "Actuele cijfers, direct in je browser. Met een prompt die alleen leest.", seed: "tool-chrome-5" },
  { id: "concept", type: "Tool", titel: "Concept-machine", kort: "Dertig conceptroutes als ruw materiaal. Jij kiest, combineert en verdedigt er één.", seed: "tool-concept-2" },
];
const VERSCHIL: [string, string, string][] = [
  ["Werk", "Wacht op de brief", "Brengt de brief mee"],
  ["Oplevering", "Klaar na livegang", "Blijft draaien en wordt gemeten"],
  ["AI", "Sneller hetzelfde maken", "Dingen maken die eerst niet konden"],
  ["Leren", "Cursussen kijken", "Elke week iets bouwen"],
  ["Bewijs", "Een cv", "Een library met wat je maakte"],
  ["Waarde", "Uren", "Ideeën en oordeel"],
];
const FAQ: [string, string][] = [
  ["Moet ik kunnen programmeren?", "Nee. Je leert bouwen met AI-tools zoals Claude. Jij schrijft op wat het moet doen, de AI schrijft de code."],
  ["Hoeveel tijd kost het?", "Reken op een middag per week voor een ronde. Het fundament kost eenmalig een uur of twee."],
  ["Wat ziet mijn werkgever?", "Alleen je verhouding uitvoerend en uitvindend, en de kaarten die jij met je team deelt. Je rolscan-antwoorden, je invalshoek en je privékaarten niet."],
  ["Is dit een cursus?", "Nee. Je maakt elke week iets voor een echte klant, en de coach helpt je scherp te blijven."],
  ["Wat als de AI-tools veranderen?", "Dan verandert je gereedschap, niet je methode. Je leert het patroon dat blijft: vraag, spec, bouwen, testen, live."],
  ["Voor wie is het?", "Voor designers, copywriters, marketeers en strategen in agencies en marketingteams, en voor wie voor zichzelf werkt. Junior of senior."],
];

export default function Voorkant() {
  return (
    <>
      <Kop nav={false} />
      <main className="wrap wide">
        <section className="hero">
          <span className="eyebrow">Uitvinder</span>
          <h1>Van uitvoerder naar <span className="grad">uitvinder.</span></h1>
          <p className="q">Het platform voor designers, copywriters en marketeers die relevant willen blijven nu AI het uitvoerende werk overneemt. Niet door meer te leren, maar door te maken.</p>
          <div className="btns">
            <a className="btn" href={SCAN}>Doe de gratis Rolscan</a>
            <Link className="btn ghost" href="/login">Log in</Link>
          </div>
        </section>

        <div className="glow stage">
          <Cover seed="stage-hero-3" w={1200} h={700} cls="lg" />
          <div className="ui" aria-hidden="true">
            <div className="side">
              <b><span className="dotm" style={{ width: 14, height: 14, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%,#fff,var(--c1) 60%,var(--c2))" }}></span>Uitvinder</b>
              <span className="on">Vandaag</span><span>Reis</span><span>Bouwen</span><span>Library</span><span>Profiel</span><span>Team</span>
            </div>
            <div>
              <span className="hint">Vandaag</span>
              <h4>Week 7 van je reis.</h4>
              <div className="uc"><i></i><small>Lopende ronde</small><div>Kerstbestellingen zonder telefoon</div></div>
              <div className="nums"><div><span className="hint">Nulmeting</span><b>18%</b></div><div><span className="hint">Nu</span><b>31%</b></div></div>
            </div>
          </div>
          <div className="float f1" aria-hidden="true"><span className="mom" style={{ justifySelf: "start" }}>Piek nu</span><b>Zorgpremies 2027 bekend</b><span className="hint">Past bij zorg en consument. Maak er een signaal van.</span></div>
          <div className="float f2" aria-hidden="true"><span className="tag go" style={{ justifySelf: "start" }}>Gestart door Thijs</span><b>Zorgkosten 2027</b><span className="hint">Iedereen heeft dezelfde vraag. Ik bouwde het antwoord.</span></div>
        </div>

        <div className="stat">
          <div><b>19%</b><p>minder werkende 22- tot 25-jarigen in de beroepen die het meest blootstaan aan AI, waaronder marketing, dan verwacht.</p></div>
          <div><b>Stabiel</b><p>blijft het werk van ervaren mensen met oordeel en ervaring in dezelfde beroepen.</p></div>
          <div><b>Groei</b><p>in beroepen waar AI mensen aanvult in plaats van vervangt. Daar zit de toekomst van je vak.</p></div>
        </div>
        <p className="hint">Bron: Stanford Digital Economy Lab, Canaries in the Coal Mine (VS, update augustus 2026)</p>

        <Mens />

        <section className="sec">
          <span className="eyebrow">De reis</span>
          <h2>Eén keer het fundament. Daarna elke week een ronde.</h2>
          <img className="beeld breed" src="/beeld/klant.jpg" alt="Een copywriter laat een bakker iets zien op haar telefoon, over de toonbank" width={1344} height={752} loading="lazy" />
          <div className="feat">
            {STAPPEN.map(([n, kop, tekst]) => (
              <div key={n}><i className="shp" data-s={n === "AI" ? "?" : n}>{n}</i><p><b>{kop}</b> {tekst}</p></div>
            ))}
          </div>
        </section>

        <section className="sec">
          <span className="eyebrow">De tools</span>
          <h2>Tools die het uitvoerende werk doen. Jij houdt het oordeel.</h2>
          <p className="lead">Analyseer advertenties, maak dertig conceptroutes, lees Ads Manager met Claude. Elke tool levert opties, jij kiest en verdedigt. Straks koppelen ze aan Figma en Canva in één regiedashboard.</p>
          <div className="tools lg">
            {TOOLS.map((t) => (
              <a key={t.id} className="tool" href={`${PROTO}#/tool/${t.id}`}>
                <Cover seed={t.seed} w={600} h={340} cls="lg" />
                <span className="tag">{t.type}</span>
                <div><h3>{t.titel}</h3><p>{t.kort}</p></div>
              </a>
            ))}
          </div>
        </section>

        <section className="sec">
          <span className="eyebrow">De markt</span>
          <h2>Elke week: wat er speelt, en wat ik ermee doe.</h2>
          <p className="lead">Trends per sector, getoetst op de drie vragen. Daarnaast mijn eigen zetten: wat ik bouw, waarom, en wat het opleverde. Ook als het tegenviel.</p>
          <div className="mini">
            <article className="trend">
              <div className="meta-l"><span className="mom">Stijgend</span><span className="tag ov">Kalender</span><span className="tag">Alle sectoren</span></div>
              <h3>Wat verandert er per 1 januari 2027?</h3>
              <p>Nieuwe regels, tarieven en toeslagen. Mensen en ondernemers zoeken wat het voor hen betekent.</p>
              <div className="link-thijs"><span className="av-s">TM</span><span>Ik deed hier iets mee: <b>Wat kost 2027</b></span></div>
            </article>
            <div className="mv">
              <span className="tag tp go">Gestart</span><b>Wat kost 2027</b>
              <p>Eén overzicht van alle huishoudkosten die in 2027 veranderen door besluiten van de overheid.</p>
              <p><span style={{ color: "var(--ink)", fontWeight: 600 }}>Waarom:</span> Per 1 januari verandert van alles tegelijk. Niemand ziet wat het bij elkaar opgeteld betekent.</p>
            </div>
          </div>
        </section>

        <section className="sec">
          <span className="eyebrow">Het verschil</span>
          <h2>AI is geen extra vak. Het is je gereedschap.</h2>
          <div className="cmpt">
            <div className="tr hd"><span className="th"></span><span>Uitvoerder</span><span>Uitvinder</span></div>
            {VERSCHIL.map(([k, a, b]) => <div key={k} className="tr"><span className="th">{k}</span><span>{a}</span><span>{b}</span></div>)}
          </div>
        </section>

        <section className="sec duo">
          <div>
            <img className="beeld" src="/beeld/team.jpg" alt="Drie collega's bekijken samen kaarten en een laptop" width={1024} height={688} loading="lazy" />
            <span className="eyebrow">Voor agencies</span>
            <h2>Zie je team verschuiven.</h2>
            <p className="lead">Eén overzicht van hoe je team beweegt van uitvoerend naar uitvindend, en een gedeelde library met geteste ideeën per klant. Reflecties blijven privé. Jij ziet alleen wat je mensen delen.</p>
          </div>
          <div>
            <img className="beeld" src="/beeld/ondernemer.jpg" alt="Een zelfstandige zit ontspannen aan de keukentafel met laptop en bonnetjes" width={1024} height={688} loading="lazy" />
            <span className="eyebrow">Voor ondernemers</span>
            <h2>Je administratie erbij geregeld.</h2>
            <p className="lead">Werk je voor jezelf, dan zie je per factuur wat je opzij zet voor btw en belasting, zet je een factuur op die klopt, en loop je na wat er bij ondernemen komt kijken.</p>
          </div>
        </section>

        <section className="sec" id="prijzen">
          <span className="eyebrow">Prijzen</span>
          <h2>Eén keer betalen of per jaar.</h2>
          <div className="prices">
            {PRIJZEN.map((p) => (
              <div key={p.naam}>
                {p.uitgelicht && <Cover seed="prijs-founding" w={400} h={400} />}
                <span className="k">{p.naam}</span><b>{p.prijs}</b><p>{p.uitleg}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="sec">
          <span className="eyebrow">Vragen</span>
          <h2>Wat je waarschijnlijk wilt weten.</h2>
          <div className="faq">
            {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
        </section>

        <section className="glow join">
          <Cover seed="join-band-2" w={1200} h={600} cls="lg" />
          <span className="eyebrow">Doe je mee?</span>
          <h2>De toekomst van je vak begint met één week.</h2>
          <p>Doe de Rolscan of zet je op de lijst voor de lancering.</p>
          <div className="btns"><a className="btn" href={SCAN}>Doe de gratis Rolscan</a></div>
          <Wachtlijst />
        </section>
      </main>
      <Voet />
    </>
  );
}
