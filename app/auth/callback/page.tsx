"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app";
import { Kop } from "@/components/Kop";

// De magic link komt hier uit. De Supabase-client wisselt de code in de URL zelf om voor een sessie.
export default function Callback() {
  const { klaar, sessie, herlaad } = useApp();
  const router = useRouter();
  const [mislukt, setMislukt] = useState(false);

  useEffect(() => {
    if (!klaar) return;
    if (sessie) {
      router.replace("/vandaag");
      return;
    }
    const p = new URLSearchParams(location.search + "&" + location.hash.slice(1));
    if (p.get("error") || p.get("error_description")) {
      setMislukt(true);
      return;
    }
    // De sessie kan net na het laden binnenkomen: nog één keer kijken.
    const t = setTimeout(() => herlaad().then(() => setMislukt(true)), 1200);
    return () => clearTimeout(t);
  }, [klaar, sessie, router, herlaad]);

  return (
    <>
      <Kop nav={false} />
      <main className="wrap">
        <div className="ph">
          <h1>{mislukt && !sessie ? "Deze link werkt niet meer." : "Je wordt ingelogd."}</h1>
          {mislukt && !sessie && <p>Een link is één keer te gebruiken en een uur geldig. Vraag een nieuwe aan.</p>}
        </div>
        {mislukt && !sessie && (
          <div className="btns" style={{ marginTop: 20 }}>
            <Link className="btn" href="/login">Nieuwe link aanvragen</Link>
          </div>
        )}
      </main>
    </>
  );
}
