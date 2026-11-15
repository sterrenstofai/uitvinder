import { APPNAV } from "@/lib/nav";

// Schermen die nog niet zijn overgezet. Het prototype blijft de werkende referentie.
const HASH: Record<string, string> = {};

export default async function Volgt({ params }: { params: Promise<{ scherm: string }> }) {
  const { scherm } = await params;
  const titel = APPNAV.find((n) => n[0] === scherm)?.[1] || "Dit scherm";
  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Volgt</div>
        <h1>{titel} is nog niet overgezet.</h1>
        <p>Dit scherm werkt al in het prototype. Het komt in een volgende stap van de bouwvolgorde naar het platform.</p>
      </div>
      <div className="btns" style={{ marginTop: 20 }}>
        <a className="btn ghost" href={`/prototype/index.html#/${HASH[scherm] || scherm}`}>Open in het prototype</a>
      </div>
    </main>
  );
}
