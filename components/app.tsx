"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getStore, heeftSupabase, type Store } from "@/lib/store";
import { leegData, leegExp, ROLLEN, type Administratie, type BeoordelingScores, type Data, type Eind, type Inzending, type Meting, type Scan, type Exp, type Invalshoek, type Profile, type Rol, type Sessie } from "@/lib/types";
import { slugify, vandaagISO, weekNr } from "@/lib/afgeleid";

type App = {
  klaar: boolean;
  modus: Store["modus"];
  sessie: Sessie | null;
  data: Data;
  toast(t: string): void;
  login(email: string): Promise<{ direct: boolean }>;
  logout(): Promise<void>;
  herlaad(): Promise<void>;
  bewaarProfiel(naam: string, rol: Rol, ondernemer: boolean): Promise<void>;
  setInv(veld: keyof Invalshoek, waarde: string): void;
  setAdm(patch: Partial<Administratie>): void;
  setOndernemer(aan: boolean): Promise<void>;
  legInvalshoekVast(): Promise<boolean>;
  nieuwExp(pre?: Partial<Exp>): Promise<Exp>;
  setExp(id: string, patch: Partial<Exp>): void;
  verwijderExp(id: string): Promise<void>;
  neemPrototypeOver(): Promise<number>;
  nieuweScan(rol: string, uitkomst: { uitvindend: number }): Promise<Scan>;
  bewaarMeting(m: Meting): Promise<void>;
  verwijderMeting(week: number): Promise<void>;
  setPortfolio(ids: string[]): Promise<void>;
  setEind(patch: Partial<Eind>): void;
  dienIn(): Promise<void>;
  inzendingen(): Promise<Inzending[]>;
  bewaarBeoordeling(deelnemer: string, scores: BeoordelingScores, cijfer: number, stelVast: boolean): Promise<void>;
};

const Ctx = createContext<App | null>(null);
export const useApp = () => {
  const a = useContext(Ctx);
  if (!a) throw new Error("useApp buiten AppProvider");
  return a;
};

const PROTOTYPE_KEY = "uitvinder-v1";
/* eslint-disable @typescript-eslint/no-explicit-any */
export function leesPrototype(): any | null {
  try {
    const s = JSON.parse(localStorage.getItem(PROTOTYPE_KEY) || "null");
    return s && s.user ? s : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => (typeof window === "undefined" ? null : getStore()), []);
  const [klaar, setKlaar] = useState(false);
  const [sessie, setSessie] = useState<Sessie | null>(null);
  const [data, setData] = useState<Data>(leegData);
  const dataRef = useRef(data);
  dataRef.current = data;
  const [toastTekst, setToastTekst] = useState("");
  const [toastAan, setToastAan] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toast = useCallback((t: string) => {
    setToastTekst(t);
    setToastAan(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastAan(false), 2200);
  }, []);

  const herlaad = useCallback(async () => {
    if (!store) return;
    try {
      const s = await store.sessie();
      setSessie(s);
      setData(s ? await store.laad(s.id) : leegData());
    } catch {
      toast("Laden lukte niet. Probeer het opnieuw.");
    }
    setKlaar(true);
  }, [store, toast]);

  useEffect(() => {
    herlaad();
  }, [herlaad]);

  // Tekstvelden worden per sleutel gebundeld weggeschreven, zoals het prototype bij elke toets opslaat.
  const wachtrij = useRef(new Map<string, { timer: ReturnType<typeof setTimeout>; run: () => Promise<void> }>());
  const plan = useCallback(
    (sleutel: string, run: () => Promise<void>) => {
      const q = wachtrij.current;
      const oud = q.get(sleutel);
      if (oud) clearTimeout(oud.timer);
      const uitvoeren = () => {
        q.delete(sleutel);
        run().catch(() => toast("Opslaan lukte niet. Controleer je verbinding."));
      };
      q.set(sleutel, { timer: setTimeout(uitvoeren, 500), run: async () => uitvoeren() });
    },
    [toast],
  );
  useEffect(() => {
    const spoel = () => {
      for (const [, v] of wachtrij.current) {
        clearTimeout(v.timer);
        v.run();
      }
    };
    window.addEventListener("pagehide", spoel);
    document.addEventListener("visibilitychange", spoel);
    return () => {
      window.removeEventListener("pagehide", spoel);
      document.removeEventListener("visibilitychange", spoel);
    };
  }, []);
  const expPatches = useRef(new Map<string, Partial<Exp>>());

  const app: App = {
    klaar,
    // Op de server is er geen opslag; de modus moet daar hetzelfde zijn als in de browser.
    modus: store?.modus ?? (heeftSupabase ? "supabase" : "lokaal"),
    sessie,
    data,
    toast,
    herlaad,
    async login(email) {
      const r = await store!.login(email);
      if (r.direct) await herlaad();
      return r;
    },
    async logout() {
      await store!.logout();
      setSessie(null);
      setData(leegData());
    },
    async bewaarProfiel(naam, rol, ondernemer) {
      if (!sessie) return;
      const p: Profile = { id: sessie.id, naam: naam.trim(), rol, agency: data.profile?.agency ?? null, ondernemer, slug: slugify(naam) + "-" + sessie.id.slice(0, 4) };
      await store!.bewaarProfiel(p);
      setData((d) => ({ ...d, profile: p }));
    },
    setInv(veld, waarde) {
      setData((d) => ({ ...d, inv: { ...d.inv, [veld]: waarde } }));
      if (sessie) plan("inv", () => store!.bewaarInvalshoek(sessie.id, dataRef.current.inv));
    },
    setAdm(patch) {
      setData((d) => ({ ...d, adm: { ...d.adm, ...patch } }));
      if (sessie) plan("adm", () => store!.bewaarAdm(sessie.id, dataRef.current.adm));
    },
    async setOndernemer(aan) {
      if (!data.profile) return;
      const p = { ...data.profile, ondernemer: aan };
      await store!.bewaarProfiel(p);
      setData((d) => ({ ...d, profile: p }));
    },
    async legInvalshoekVast() {
      const zin = data.inv.zin.trim();
      if (!zin || !sessie) return false;
      await store!.bewaarInvalshoek(sessie.id, { ...data.inv, zin });
      const lv = data.versies[data.versies.length - 1];
      if (!lv || lv.zin !== zin) {
        const v = await store!.nieuweVersie({ zin, datum: vandaagISO(), week: Math.min(weekNr(data), 12) });
        setData((d) => ({ ...d, versies: [...d.versies, v] }));
      }
      return true;
    },
    async nieuwExp(pre) {
      const e = await store!.nieuwExp({
        ...leegExp(),
        week: Math.min(weekNr(data), 12),
        auteur: data.profile?.naam || "",
        ...pre,
      });
      setData((d) => ({ ...d, exps: [...d.exps, e] }));
      return e;
    },
    setExp(id, patch) {
      setData((d) => ({ ...d, exps: d.exps.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
      const m = expPatches.current;
      m.set(id, { ...m.get(id), ...patch });
      plan("exp-" + id, async () => {
        const p = m.get(id);
        m.delete(id);
        if (p) await store!.wijzigExp(id, p);
      });
    },
    async verwijderExp(id) {
      expPatches.current.delete(id);
      await store!.verwijderExp(id);
      setData((d) => ({ ...d, exps: d.exps.filter((e) => e.id !== id) }));
    },
    async nieuweScan(rol, uitkomst) {
      const s = await store!.nieuweScan({ datum: vandaagISO(), rol, uitkomst, pct_uitvindend: Math.round(uitkomst.uitvindend * 100) / 100 });
      setData((d) => ({ ...d, scans: [...d.scans, s] }));
      // Hoort deze scan bij de meting van vandaag, dan komt het percentage daar ook te staan.
      const mt = dataRef.current.metingen.find((m) => m.datum === vandaagISO());
      if (mt) {
        const m2 = { ...mt, pct_rolscan: Math.round(uitkomst.uitvindend) };
        await store!.bewaarMeting(m2);
        setData((d) => ({ ...d, metingen: d.metingen.map((m) => (m.week === m2.week ? m2 : m)) }));
      }
      return s;
    },
    async bewaarMeting(m) {
      await store!.bewaarMeting(m);
      setData((d) => ({ ...d, metingen: [...d.metingen.filter((x) => x.week !== m.week), m].sort((a, b) => a.week - b.week) }));
    },
    async verwijderMeting(week) {
      await store!.verwijderMeting(week);
      setData((d) => ({ ...d, metingen: d.metingen.filter((x) => x.week !== week) }));
    },
    async setPortfolio(ids) {
      setData((d) => ({ ...d, portfolio: ids }));
      await store!.bewaarPortfolio(ids);
    },
    setEind(patch) {
      setData((d) => ({ ...d, eind: { ...d.eind, ...patch } }));
      plan("eind", () => store!.bewaarEind(dataRef.current.eind));
    },
    async dienIn() {
      // Een nog wachtende tussentijdse opslag mag de inzending niet overschrijven.
      const w = wachtrij.current.get("eind");
      if (w) {
        clearTimeout(w.timer);
        wachtrij.current.delete("eind");
      }
      const e = { ...dataRef.current.eind, ingediend_op: new Date().toISOString() };
      await store!.bewaarPortfolio(dataRef.current.portfolio);
      await store!.bewaarEind({ ...dataRef.current.eind, ingediend_op: null });
      await store!.bewaarEind(e);
      setData((d) => ({ ...d, eind: e }));
    },
    inzendingen: () => store!.inzendingen(),
    bewaarBeoordeling: (deelnemer, scores, cijfer, stelVast) =>
      store!.bewaarBeoordeling(deelnemer, scores, cijfer, stelVast, data.profile?.naam || ""),
    // De localStorage-structuur van het prototype overzetten naar het account.
    async neemPrototypeOver() {
      const S = leesPrototype();
      if (!S || !sessie) return 0;
      for (const s of S.scans || []) {
        if (!s?.res || typeof s.res.uitvindend !== "number") continue;
        await store!.nieuweScan({ datum: s.datum || vandaagISO(), rol: s.rol || null, uitkomst: s.res, pct_uitvindend: s.res.uitvindend });
      }
      const i = S.inv || {};
      if (i.zin || i.vak || i.buiten || i.voorwie)
        await store!.bewaarInvalshoek(sessie.id, { vak: i.vak || "", buiten: i.buiten || "", voorwie: i.voorwie || "", zin: i.zin || "" });
      for (const v of i.versies || [])
        if (v?.zin) await store!.nieuweVersie({ zin: v.zin, datum: v.datum || vandaagISO(), week: Math.min(Math.max(v.week || 1, 1), 12) });
      let n = 0;
      for (const e of S.exps || []) {
        const t = (k: string) => String(e[k] || "");
        const af = e.status === "af" && t("hypothese").trim() && t("uitkomst").trim();
        await store!.nieuwExp({
          ...leegExp(),
          auteur: t("auteur"), klant: t("klant"), titel: t("titel"), signaal: t("signaal"), waarom: t("waarom"),
          hypothese: t("hypothese"), keuze: t("keuze"), bouw: t("bouw"), tool: t("tool"), spec: t("spec"), link: t("link"),
          meting: t("meting"), uitkomst: t("uitkomst"), geleerd: t("geleerd"),
          // Teamkaarten worden privé: het voorbeeldteam uit het prototype bestaat hier niet.
          zichtbaarheid: e.zicht === "publiek" ? "publiek" : "prive",
          status: af ? "af" : "bezig",
          remix_titel: e.remixVan?.titel || null, remix_auteur: e.remixVan?.auteur || null,
          week: Math.max(Number(e.week) || 1, 1), datum: e.datum || vandaagISO(),
        });
        n++;
      }
      await herlaad();
      return n;
    },
  };

  return (
    <Ctx.Provider value={app}>
      {children}
      <div className={"toast" + (toastAan ? " on" : "")} role="status" aria-live="polite">
        {toastTekst}
      </div>
    </Ctx.Provider>
  );
}

export const isRol = (r: unknown): r is Rol => (ROLLEN as readonly string[]).includes(r as string);
