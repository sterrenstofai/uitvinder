// Opslag. Twee uitvoeringen met dezelfde vorm:
// - Supabase (EU): het echte platform, met login en row level security.
// - Lokaal: voorbeeldmodus zolang er geen Supabase-project gekoppeld is.
//   Gegevens blijven dan op dit apparaat, net als in het prototype.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { leegAdm, leegData, leegExp, type Administratie, type Data, type Exp, type Invalshoek, type Profile, type Scan, type Sessie, type Versie } from "./types";

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
      const [p, s, i, v, e, m, a] = await Promise.all([
        sb.from("profiles").select("id,naam,rol,agency,ondernemer,slug").eq("id", uid).maybeSingle(),
        sb.from("scans").select("id,datum,rol,uitkomst,pct_uitvindend").eq("user_id", uid).order("datum").order("aangemaakt_op"),
        sb.from("invalshoeken").select("vak,buiten,voorwie,zin").eq("user_id", uid).maybeSingle(),
        sb.from("invalshoek_versies").select("id,zin,datum,week").eq("user_id", uid).order("datum"),
        sb.from("experiments").select(EXP_KOLOMMEN).eq("user_id", uid).order("aangemaakt_op"),
        sb.from("memberships").select("team_id").eq("user_id", uid),
        sb.from("administratie").select("btw_tarief,belasting_pct,stappen_af,bedrijf").eq("user_id", uid).maybeSingle(),
      ]);
      [p, s, i, v, e, m, a].forEach((r) => fout(r.error));
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
    async wachtlijst(email) {
      const { error } = await sb.from("waitlist").insert({ email });
      // 23505: dit adres staat er al op. Voor de bezoeker is dat hetzelfde als gelukt.
      if (error && error.code !== "23505") throw new Error(error.message);
    },
  };
}

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
      return { ...leegData(), ...d, adm };
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
