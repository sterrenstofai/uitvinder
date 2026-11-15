// De studiewijzer is openbaar: ook wie nog geen account heeft, en een beoordelaar
// of werkgever, kan zien wat de reis vraagt en hoe er getoetst wordt.
import type { Metadata } from "next";
import Link from "next/link";
import { Kop, Voet } from "@/components/Kop";
import { leesStudiewijzer } from "@/lib/lessen";

export const metadata: Metadata = { title: "Studiewijzer — Van uitvoerder naar uitvinder" };

export default function Studiewijzer() {
  const inhoud = leesStudiewijzer();
  return (
    <>
      <Kop nav={false} />
      <main className="wrap">
        <div className="ph">
          <div className="lbl">Studiewijzer</div>
          <h1>Wat je leert en hoe je getoetst wordt.</h1>
          <p>Twaalf weken, ongeveer 56 uur. Leeruitkomsten, programma, toetsing, rubrics en literatuur op één plek.</p>
        </div>
        {inhoud ? <article className="gids md" dangerouslySetInnerHTML={{ __html: inhoud }} /> : <div className="empty">[INHOUD VOLGT]</div>}
        <div className="btns" style={{ marginTop: 32 }}>
          <Link className="btn" href="/login">Naar het platform</Link>
          <Link className="btn ghost" href="/">Terug naar de voorkant</Link>
        </div>
      </main>
      <Voet />
    </>
  );
}
