"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app";
import { CoachBox, LesBox } from "@/components/Les";
import { Proeftuin2 } from "@/components/Proeftuin";
import type { Les } from "@/lib/lessen";

export function InvalshoekScherm({ les }: { les: Les }) {
  const { data, setInv, legInvalshoekVast, toast } = useApp();
  const router = useRouter();
  const i = data.inv;
  async function legVast() {
    if (!i.zin.trim()) return toast("Schrijf eerst je zin");
    try {
      await legInvalshoekVast();
      toast("Invalshoek vastgelegd");
      router.push("/vandaag");
    } catch {
      toast("Opslaan lukte niet. Probeer het opnieuw.");
    }
  }
  const ctx = () =>
    `Rol: ${data.profile?.rol || ""}\nVak: ${i.vak}\nVan buiten het vak: ${i.buiten}\nVoor wie relevant: ${i.voorwie}\nHuidige zin: ${i.zin || "(nog leeg)"}`;
  return (
    <main className="wrap">
      <div className="ph">
        <div className="lbl">Fundament, stap 2</div>
        <h1>Jouw invalshoek.</h1>
        <p>Iedereen kan met AI een post maken. Wat niemand kan namaken, is de combinatie die alleen jij hebt: je vak plus iets van daarbuiten.</p>
      </div>
      <section className="step">
        <div className="step-h"><b>2</b><h2>Wat combineer jij?</h2></div>
        <div className="step-b">
          <LesBox les={les} />
          <Proeftuin2 start={{ zin: i.zin, voorwie: i.voorwie }} neem={(v) => { setInv("zin", v.zin); if (v.voorwie) setInv("voorwie", v.voorwie); if (v.buiten) setInv("buiten", v.buiten); }} />
          <label className="f"><span>Je vak</span><input type="text" value={i.vak} onChange={(e) => setInv("vak", e.target.value)} placeholder="Bijvoorbeeld: brand designer, 8 jaar agency" /></label>
          <label className="f"><span>Iets van buiten je vak</span><small>Een vorige baan, een hobby die uit de hand liep, een wereld die je van binnen kent.</small><input type="text" value={i.buiten} onChange={(e) => setInv("buiten", e.target.value)} placeholder="Bijvoorbeeld: ik heb vier jaar in de horeca gewerkt" /></label>
          <label className="f"><span>Voor wie wil je relevant zijn?</span><input type="text" value={i.voorwie} onChange={(e) => setInv("voorwie", e.target.value)} placeholder="Bijvoorbeeld: familiebedrijven in de regio" /></label>
          <label className="f"><span>Je invalshoek in één zin</span><textarea value={i.zin} onChange={(e) => setInv("zin", e.target.value)} placeholder="Ik ... omdat ..." /></label>
          <CoachBox stap="invalshoek" context={ctx} />
          <div className="btns" style={{ marginTop: 18 }}><button className="btn" onClick={legVast}>Leg vast</button></div>
        </div>
      </section>
      {data.versies.length > 0 && (
        <>
          <div className="grp"><span>Eerdere versies</span><span>Bewijs voor je reflectie</span></div>
          <ul className="list">
            {data.versies.slice().reverse().map((v) => (
              <li key={v.id} className="row"><span className="nm">{v.zin}</span><span className="hint">Week {v.week}</span></li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
