// Opslag. Twee uitvoeringen met dezelfde vorm:
// - Supabase (EU): het echte platform, met login en row level security.
// - Lokaal: voorbeeldmodus zolang er geen Supabase-project gekoppeld is.
//   Gegevens blijven dan op dit apparaat, net als in het prototype.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { leegAdm, leegData, leegExp, type Administratie, type Beoordeling, type BeoordelingScores, type Data, type Eind, type Inzending, type Klant, type Koppeling, type Meting, type Taak, type Exp, type Invalshoek, type Profile, type Scan, type Sessie, type Versie } from "./types";

export interface Store {
  modus: "supabase" | "lokaal";
  sessie(): Promise<Sessie | null>;
  /** Supabase: stuurt een magic link. Lokaal: logt direct in. */
  login(email: string): Promise<{ direct: boolean }>;
  logout(): Promise<void>;
  laad(uid: string): Promise<Data>;
  bewaarProfiel(p: Profile): Promise<void>;
  bewaarInvalshoek(uid: string, inv: Invalshoek): Promise<void>;
  bewaarAdm(uid: string, adm: Administratie): Promise<void>;
  nieuweVersie(v: Omit<Versie, "id">): Promise<Versie>;
  nieuweScan(s: Omit<Scan, "id">): Promise<Scan>;
  nieuwExp(e: Omit<Exp, "id">): Promise<Exp>;
  wijzigExp(id: string, patch: Partial<Exp>): Promise<void>;
  verwijderExp(id: string): Promise<void>;
  bewaarMeting(m: Meting): Promise<void>;
  verwijderMeting(week: number): Promise<void>;
  bewaarPortfolio(ids: string[]): Promise<void>;
  bewaarEind(e: Eind): Promise<void>;
  nieuweKlant(k: Omit<Klant, "id">): Promise<Klant>;
  verwijderKlant(id: string): Promise<void>;
  nieuweTaken(t: Omit<Taak, "id">[]): Promise<Taak[]>;
  wijzigTaak(id: string, patch: Partial<Taak>): Promise<void>;
  zetKoppeling(klantId: string, tool: string, aan: boolean): Promise<void>;
  /** Voor de beoordelaar: wat is ingediend en mag ik zien? */
  inzendingen(): Promise<Inzending[]>;
  bewaarBeoordeling(deelnemer: string, scores: BeoordelingScores, cijfer: number, stelVast: boolean, naam: string): Promise<void>;
  /** Wachtlijst op de voorkant. Kan zonder account. */
  wachtlijst(email: string): Promise<void>;
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Het platform heeft een eigen schema, zodat het een Supabase-project kan delen met een ander product.
const SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || "uitvinder";

function fout(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

const EXP_KOLOMMEN =
  "id,team_id,auteur,klant,titel,signaal,waarom,hypothese,keuze,bouw,tool,spec,link,meting,uitkomst,geleerd,zichtbaarheid,status,remix_titel,remix_auteur,bron_tool,week,datum";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function supabaseStore(sb: SupabaseClient<any, any, any>): Store {
  return {
    modus: "supabase",
    async sessie() {
      const { data } = await sb.auth.getSession();
      const u = data.session?.user;
      return u ? { id: u.id, email: u.email || "" } : null;
    },
    async login(email) {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      fout(error);
      return { direct: false };
    },
    async logout() {
      await sb.auth.signOut();
    },
    async laad(uid) {
      const [p, s, i, v, e, m, a, mt, pf, ei, bo, bh, kl, tk, kp] = await Promise.all([
        sb.from("profiles").select("id,naam,rol,agency,ondernemer,slug").eq("id", uid).maybeSingle(),
        sb.from("scans").select("id,datum,rol,uitkomst,pct_uitvindend").eq("user_id", uid).order("datum").order("aangemaakt_op"),
        sb.from("invalshoeken").select("vak,buiten,voorwie,zin").eq("user_id", uid).maybeSingle(),
        sb.from("invalshoek_versies").select("id,zin,datum,week").eq("user_id", uid).order("datum"),
        sb.from("experiments").select(EXP_KOLOMMEN).eq("user_id", uid).order("aangemaakt_op"),
        sb.from("memberships").select("team_id,rol").eq("user_id", uid),
        sb.from("administratie").select("btw_tarief,belasting_pct,stappen_af,bedrijf").eq("user_id", uid).maybeSingle(),
        sb.from("metingen").select("week,scores,pct_rolscan,datum").eq("user_id", uid).order("week"),
        sb.from("portfolio").select("experiment_ids").eq("user_id", uid).maybeSingle(),
        sb.from("eindopdrachten").select("pitch_link,reflectie,ingediend_op").eq("user_id", uid).maybeSingle(),
        sb.from("beoordelingen").select(BEO_KOLOMMEN).eq("deelnemer_id", uid).not("vastgesteld_op", "is", null).order("vastgesteld_op", { ascending: false }).limit(1),
        sb.rpc("is_beheer"),
        sb.from("klanten").select(KLANT_KOLOMMEN).order("aangemaakt_op"),
        sb.from("taken").select(TAAK_KOLOMMEN).order("aangemaakt_op"),
        sb.from("koppelingen").select("klant_id,tool,status"),
      ]);
      // De tabellen voor beoordelen komen uit de tweede migratie. Is die nog niet
      // uitgevoerd, dan werkt de rest van het platform gewoon door.
      [p, s, i, v, e, m, a, mt, pf, ei, kl, tk, kp].forEach((r) => fout(r.error));
      return {
        profile: (p.data as Profile) ?? null,
        scans: ((s.data as Scan[]) ?? []).map((x) => ({ ...x, pct_uitvindend: Number(x.pct_uitvindend) })),
        inv: (i.data as Invalshoek) ?? leegData().inv,
        versies: (v.data as Versie[]) ?? [],
        exps: (e.data as unknown as Exp[]) ?? [],
        teamIds: (m.data ?? []).map((x) => x.team_id as string),
        adm: a.data
          ? { ...(a.data as Administratie), btw_tarief: Number(a.data.btw_tarief), belasting_pct: a.data.belasting_pct === null ? null : Number(a.data.belasting_pct) }
          : leegAdm(),
        metingen: ((mt.data as Meting[]) ?? []).map(metingUit),
        portfolio: (pf.data?.experiment_ids as string[]) ?? [],
        eind: (ei.data as Eind) ?? leegData().eind,
        beoordeling: bo.error ? null : beoordelingUit((bo.data ?? [])[0]),
        magBeoordelen: bh.data === true || (m.data ?? []).some((x) => x.rol === "beoordelaar"),
        klanten: (kl.data as Klant[]) ?? [],
        taken: ((tk.data as Taak[]) ?? []).map(taakUit),
        koppelingen: (kp.data as Koppeling[]) ?? [],
      };
    },
    async bewaarProfiel(p) {
      fout((await sb.from("profiles").upsert(p)).error);
    },
    async bewaarInvalshoek(uid, inv) {
      fout((await sb.from("invalshoeken").upsert({ user_id: uid, ...inv, bijgewerkt_op: new Date().toISOString() })).error);
    },
    async bewaarAdm(uid, adm) {
      fout((await sb.from("administratie").upsert({ user_id: uid, ...adm, bijgewerkt_op: new Date().toISOString() })).error);
    },
    async nieuweVersie(v) {
      const r = await sb.from("invalshoek_versies").insert(v).select("id,zin,datum,week").single();
      fout(r.error);
      return r.data as Versie;
    },
    async nieuweScan(s) {
      const r = await sb.from("scans").insert(s).select("id,datum,rol,uitkomst,pct_uitvindend").single();
      fout(r.error);
      return r.data as Scan;
    },
    async nieuwExp(e) {
      const r = await sb.from("experiments").insert(e).select(EXP_KOLOMMEN).single();
      fout(r.error);
      return r.data as unknown as Exp;
    },
    async wijzigExp(id, patch) {
      fout((await sb.from("experiments").update(patch).eq("id", id)).error);
    },
    async verwijderExp(id) {
      fout((await sb.from("experiments").delete().eq("id", id)).error);
    },
    async bewaarMeting(mt) {
      const uid = (await sb.auth.getUser()).data.user?.id;
      fout((await sb.from("metingen").upsert({ user_id: uid, ...mt }, { onConflict: "user_id,week" })).error);
    },
    async verwijderMeting(week) {
      fout((await sb.from("metingen").delete().eq("week", week)).error);
    },
    async bewaarPortfolio(ids) {
      const uid = (await sb.auth.getUser()).data.user?.id;
      fout((await sb.from("portfolio").upsert({ user_id: uid, experiment_ids: ids, bijgewerkt_op: new Date().toISOString() })).error);
    },
    async bewaarEind(e) {
      const uid = (await sb.auth.getUser()).data.user?.id;
      fout((await sb.from("eindopdrachten").upsert({ user_id: uid, ...e })).error);
    },
    async nieuweKlant(k) {
      const r = await sb.from("klanten").insert(k).select(KLANT_KOLOMMEN).single();
      fout(r.error);
      return r.data as Klant;
    },
    async verwijderKlant(kid) {
      fout((await sb.from("klanten").delete().eq("id", kid)).error);
    },
    async nieuweTaken(t) {
      const r = await sb.from("taken").insert(t).select(TAAK_KOLOMMEN);
      fout(r.error);
      return ((r.data as Taak[]) ?? []).map(taakUit);
    },
    async wijzigTaak(tid, patch) {
      const uid = (await sb.auth.getUser()).data.user?.id;
      const besluit = patch.status === "goedgekeurd" || patch.status === "gestopt" ? { besloten_door: uid } : {};
      fout((await sb.from("taken").update({ ...patch, ...besluit }).eq("id", tid)).error);
    },
    async zetKoppeling(klantId, tool, aan) {
      fout((await sb.from("koppelingen").upsert({ klant_id: klantId, tool, status: aan ? "actief" : "uit" }, { onConflict: "klant_id,tool" })).error);
    },
    async inzendingen() {
      const uid = (await sb.auth.getUser()).data.user?.id;
      const ei = await sb.from("eindopdrachten").select("user_id,pitch_link,reflectie,ingediend_op").not("ingediend_op", "is", null).neq("user_id", uid).order("ingediend_op");
      fout(ei.error);
      const ids = (ei.data ?? []).map((x) => x.user_id as string);
      if (!ids.length) return [];
      const [pr, pf, mt, bo] = await Promise.all([
        sb.from("profiles").select("id,naam,rol").in("id", ids),
        sb.from("portfolio").select("user_id,experiment_ids").in("user_id", ids),
        sb.from("metingen").select("user_id,week,scores,pct_rolscan,datum").in("user_id", ids).order("week"),
        sb.from("beoordelingen").select(BEO_KOLOMMEN).in("deelnemer_id", ids).eq("beoordelaar_id", uid),
      ]);
      [pr, pf, mt, bo].forEach((r) => fout(r.error));
      const kaartIds = (pf.data ?? []).flatMap((x) => x.experiment_ids as string[]);
      const ex = kaartIds.length ? await sb.from("experiments").select(EXP_KOLOMMEN + ",user_id").in("id", kaartIds) : { data: [], error: null };
      fout(ex.error);
      return (ei.data ?? []).map((e) => {
        const id = e.user_id as string;
        const volgorde = ((pf.data ?? []).find((x) => x.user_id === id)?.experiment_ids as string[]) ?? [];
        const kaarten = ((ex.data ?? []) as unknown as (Exp & { user_id: string })[]).filter((k) => k.user_id === id);
        const p = (pr.data ?? []).find((x) => x.id === id);
        return {
          deelnemer: { id, naam: (p?.naam as string) || "Onbekend", rol: (p?.rol as string) || "" },
          eind: { pitch_link: e.pitch_link as string, reflectie: e.reflectie as string, ingediend_op: e.ingediend_op as string },
          kaarten: volgorde.map((k) => kaarten.find((x) => x.id === k)).filter((x): x is Exp & { user_id: string } => Boolean(x)),
          metingen: ((mt.data ?? []).filter((x) => x.user_id === id) as unknown as Meting[]).map(metingUit),
          beoordeling: beoordelingUit((bo.data ?? []).find((x) => (x as unknown as Beoordeling).deelnemer_id === id)),
        };
      });
    },
    async bewaarBeoordeling(deelnemer, scores, cijfer, stelVast, naam) {
      const uid = (await sb.auth.getUser()).data.user?.id;
      const rij = {
        deelnemer_id: deelnemer, beoordelaar_id: uid, scores, cijfer: Math.round(cijfer * 10) / 10, beoordelaar_naam: naam,
        ...(stelVast ? { vastgesteld_op: new Date().toISOString() } : {}),
      };
      fout((await sb.from("beoordelingen").upsert(rij, { onConflict: "deelnemer_id,beoordelaar_id" })).error);
    },
    async wachtlijst(email) {
      const { error } = await sb.from("waitlist").insert({ email });
      // 23505: dit adres staat er al op. Voor de bezoeker is dat hetzelfde als gelukt.
      if (error && error.code !== "23505") throw new Error(error.message);
    },
  };
}

const KLANT_KOLOMMEN = "id,naam,sector,merk,doelgroep,kanalen";
const TAAK_KOLOMMEN = "id,klant_id,agent,tool,titel,aanleiding,opties,uren,status,besluit,historie";
const taakUit = (t: Taak): Taak => ({ ...t, uren: t.uren === null ? null : Number(t.uren), opties: t.opties ?? [], historie: t.historie ?? [] });
const BEO_KOLOMMEN = "id,deelnemer_id,scores,cijfer,vastgesteld_op,beoordelaar_naam";
const metingUit = (m: Meting): Meting => ({ ...m, pct_rolscan: m.pct_rolscan === null ? null : Number(m.pct_rolscan) });
const beoordelingUit = (b: unknown): Beoordeling | null => {
  if (!b) return null;
  const x = b as Beoordeling;
  return { ...x, cijfer: x.cijfer === null ? null : Number(x.cijfer) };
};

const LK = "uitvinder-lokaal-v1";
type Lokaal = { sessie: Sessie | null; data: Data };

function lokaalStore(): Store {
  const lees = (): Lokaal => {
    try {
      const s = JSON.parse(localStorage.getItem(LK) || "null");
      if (s && s.data) return s;
    } catch {}
    return { sessie: null, data: leegData() };
  };
  const schrijf = (s: Lokaal) => {
    try {
      localStorage.setItem(LK, JSON.stringify(s));
    } catch {}
  };
  const muteer = (f: (d: Data) => void) => {
    const s = lees();
    f(s.data);
    schrijf(s);
  };
  const id = () => crypto.randomUUID();
  return {
    modus: "lokaal",
    async sessie() {
      return lees().sessie;
    },
    async login(email) {
      const s = lees();
      s.sessie = { id: "lokaal", email };
      schrijf(s);
      return { direct: true };
    },
    async logout() {
      const s = lees();
      s.sessie = null;
      schrijf(s);
    },
    async laad() {
      const d = lees().data;
      const adm = { ...leegAdm(), ...d.adm };
      // Eerdere versie bewaarde nummers in plaats van onderwerpen.
      adm.stappen_af = (adm.stappen_af as unknown[]).filter((x): x is string => typeof x === "string");
      // Een concept-beoordeling ziet de deelnemer niet; pas na vaststelling.
      return { ...leegData(), ...d, adm, beoordeling: d.beoordeling?.vastgesteld_op ? d.beoordeling : null, magBeoordelen: true };
    },
    async bewaarProfiel(p) {
      muteer((d) => void (d.profile = p));
    },
    async bewaarInvalshoek(_uid, inv) {
      muteer((d) => void (d.inv = inv));
    },
    async bewaarAdm(_uid, adm) {
      muteer((d) => void (d.adm = adm));
    },
    async nieuweVersie(v) {
      const n = { id: id(), ...v };
      muteer((d) => void d.versies.push(n));
      return n;
    },
    async nieuweScan(sc) {
      const n = { id: id(), ...sc };
      muteer((d) => void d.scans.push(n));
      return n;
    },
    async nieuwExp(e) {
      const n = { ...leegExp(), ...e, id: id() };
      muteer((d) => void d.exps.push(n));
      return n;
    },
    async wijzigExp(eid, patch) {
      muteer((d) => {
        const e = d.exps.find((x) => x.id === eid);
        if (e) Object.assign(e, patch);
      });
    },
    async verwijderExp(eid) {
      muteer((d) => void (d.exps = d.exps.filter((x) => x.id !== eid)));
    },
    async bewaarMeting(mt) {
      muteer((d) => void (d.metingen = [...(d.metingen || []).filter((x) => x.week !== mt.week), mt].sort((a, b) => a.week - b.week)));
    },
    async verwijderMeting(week) {
      muteer((d) => void (d.metingen = (d.metingen || []).filter((x) => x.week !== week)));
    },
    async bewaarPortfolio(ids) {
      muteer((d) => void (d.portfolio = ids));
    },
    async bewaarEind(e) {
      muteer((d) => void (d.eind = e));
    },
    async nieuweKlant(k) {
      const n = { ...k, id: id() };
      muteer((d) => void (d.klanten = [...(d.klanten || []), n]));
      return n;
    },
    async verwijderKlant(kid) {
      muteer((d) => {
        d.klanten = (d.klanten || []).filter((x) => x.id !== kid);
        d.taken = (d.taken || []).filter((x) => x.klant_id !== kid);
        d.koppelingen = (d.koppelingen || []).filter((x) => x.klant_id !== kid);
      });
    },
    async nieuweTaken(t) {
      const n = t.map((x) => ({ ...x, id: id() }));
      muteer((d) => void (d.taken = [...(d.taken || []), ...n]));
      return n;
    },
    async wijzigTaak(tid, patch) {
      muteer((d) => {
        const t = (d.taken || []).find((x) => x.id === tid);
        if (t) Object.assign(t, patch);
      });
    },
    async zetKoppeling(klantId, tool, aan) {
      muteer((d) => void (d.koppelingen = [...(d.koppelingen || []).filter((x) => !(x.klant_id === klantId && x.tool === tool)), { klant_id: klantId, tool, status: aan ? "actief" : "uit" }]));
    },
    // In voorbeeldmodus is er geen tweede persoon. Je beoordeelt je eigen
    // inzending, om te zien hoe het voor een beoordelaar werkt.
    async inzendingen() {
      const d = { ...leegData(), ...lees().data };
      if (!d.eind.ingediend_op) return [];
      return [{
        deelnemer: { id: "lokaal", naam: d.profile?.naam || "Jij", rol: d.profile?.rol || "" },
        eind: d.eind,
        kaarten: d.portfolio.map((id) => d.exps.find((e) => e.id === id)).filter((e): e is Exp => Boolean(e)),
        metingen: d.metingen,
        beoordeling: d.beoordeling,
      }];
    },
    async bewaarBeoordeling(deelnemer, scores, cijfer, stelVast, naam) {
      muteer((d) => void (d.beoordeling = {
        id: d.beoordeling?.id || id(), deelnemer_id: deelnemer, scores, cijfer: Math.round(cijfer * 10) / 10,
        vastgesteld_op: stelVast ? new Date().toISOString() : null, beoordelaar_naam: naam,
      }));
    },
    async wachtlijst() {
      throw new Error("In voorbeeldmodus is er geen wachtlijst.");
    },
  };
}

let store: Store | null = null;
export function getStore(): Store {
  if (store) return store;
  store =
    URL && KEY
      ? supabaseStore(createClient(URL, KEY, { db: { schema: SCHEMA }, auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true } }))
      : lokaalStore();
  return store;
}
export const heeftSupabase = Boolean(URL && KEY);
