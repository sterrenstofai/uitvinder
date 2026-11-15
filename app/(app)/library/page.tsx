"use client";
import Link from "next/link";
import { useApp } from "@/components/app";
import { Kaart } from "@/components/Kaart";
import { afgerond } from "@/lib/afgeleid";

// Je eigen library. De teamlibrary en de drie tools volgen; die staan nog in het prototype.
export default function Library() {
  const { data } = useApp();
  const af = afgerond(data), bezig = data.exps.filter((e) => e.status !== "af");
  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Library</div>
        <h1>Wat je maakte.</h1>
        <p>Elke afgeronde ronde staat hier als kaart. Je library groeit door wat je maakt, niet door wat je leest.</p>
      </div>
      <div className="grp"><span>Afgerond</span><span>{af.length} van 10</span></div>
      {af.length ? <div style={{ marginTop: 10 }}>{af.slice().reverse().map((e) => <Kaart key={e.id} e={e} eigen />)}</div> : <div className="empty" style={{ marginTop: 10 }}>Nog geen afgeronde rondes.</div>}
      {bezig.length > 0 && (
        <>
          <div className="grp"><span>Loopt nog</span><span>{bezig.length}</span></div>
          <div style={{ marginTop: 10 }}>{bezig.slice().reverse().map((e) => <Kaart key={e.id} e={e} eigen />)}</div>
        </>
      )}
      <div className="btns" style={{ marginTop: 20 }}>
        <Link className="btn" href="/ronde/nieuw">Start een nieuwe ronde</Link>
        <a className="btn ghost" href="/prototype/index.html#/library">Tools in het prototype</a>
      </div>
    </main>
  );
}
