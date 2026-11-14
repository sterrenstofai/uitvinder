import Link from "next/link";
import { Cover } from "@/components/Cover";
import { Kop, Voet } from "@/components/Kop";

// Tijdelijke voorkant. De voorkant en de Rolscan uit het prototype worden later overgezet.
export default function Voorkant() {
  return (
    <>
      <Kop nav={false} />
      <main className="wrap wide">
        <section className="dash-h">
          <Cover seed="voorkant" w={1200} h={520} cls="lg" />
          <div className="lbl">Door Thijs Mensink</div>
          <h1>Van uitvoerder naar uitvinder.</h1>
          <div className="btns" style={{ marginTop: 24 }}>
            <Link className="btn" href="/login">Log in</Link>
            <a className="btn ghost" href="/prototype/index.html">Bekijk het prototype</a>
          </div>
        </section>
      </main>
      <Voet />
    </>
  );
}
