export const ROLLEN = ["designer", "copywriter", "marketeer", "strateeg", "anders"] as const;
export type Rol = (typeof ROLLEN)[number];
export type Zichtbaarheid = "prive" | "team" | "publiek";

export type Toon = { inv: boolean; shift: boolean; exps: boolean };
export type Profile = { id: string; naam: string; rol: Rol; agency: string | null; ondernemer: boolean; slug: string | null; publiek: boolean; toon: Toon };
export const TOON_STANDAARD: Toon = { inv: true, shift: true, exps: true };

export type Scan = { id: string; datum: string; rol: string | null; uitkomst: unknown; pct_uitvindend: number };

export type Invalshoek = { vak: string; buiten: string; voorwie: string; zin: string };
export type Versie = { id: string; zin: string; datum: string; week: number };

export type Exp = {
  id: string;
  team_id: string | null;
  auteur: string;
  klant: string;
  titel: string;
  signaal: string;
  waarom: string;
  hypothese: string;
  keuze: string;
  bouw: string;
  tool: string;
  spec: string;
  link: string;
  meting: string;
  uitkomst: string;
  geleerd: string;
  zichtbaarheid: Zichtbaarheid;
  status: "bezig" | "af";
  remix_titel: string | null;
  remix_auteur: string | null;
  bron_tool: string | null;
  week: number;
  datum: string;
};
export type ExpVeld = keyof Omit<Exp, "id">;

export type Bedrijf = { naam?: string; adres?: string; kvk?: string; btwid?: string; iban?: string };
export type Administratie = { btw_tarief: number; belasting_pct: number | null; stappen_af: string[]; bedrijf: Bedrijf };
export const leegAdm = (): Administratie => ({ btw_tarief: 21, belasting_pct: null, stappen_af: [], bedrijf: {} });

export type MetingScores = { gen: number; prom: number; real: number; cse: number };
export type Meting = { week: number; scores: MetingScores; pct_rolscan: number | null; datum: string };
export type Eind = { pitch_link: string; reflectie: string; ingediend_op: string | null };
// niveau per criterium: 0 onvoldoende, 1 voldoende, 2 goed, 3 excellent
export type BeoordelingScores = { kaarten: Record<string, number[]>; eind: number[]; portfolio?: number; eindopdracht?: number };
export type Beoordeling = {
  id: string; deelnemer_id: string; scores: BeoordelingScores; cijfer: number | null;
  vastgesteld_op: string | null; beoordelaar_naam: string | null;
};
export type Inzending = {
  deelnemer: { id: string; naam: string; rol: string };
  eind: Eind; kaarten: Exp[]; metingen: Meting[]; beoordeling: Beoordeling | null;
};

export type Klant = { id: string; naam: string; sector: string | null; merk: string | null; doelgroep: string | null; kanalen: string[] };
export type Taak = {
  id: string; klant_id: string; agent: string; tool: string | null; titel: string; aanleiding: string;
  opties: string[]; uren: number | null; status: "bezig" | "klaar" | "goedgekeurd" | "gestopt"; besluit: string; historie: string[];
};
export type Koppeling = { klant_id: string; tool: string; status: string };

export type Bouw = { gedaan: number[]; velden: Record<string, string>; spec: string };
export type Trend = { id: string; titel: string; bron: string | null; momentum: string | null; sectoren: string[]; uitleg: string; wat_je_kunt_doen: string };
export type Zet = { id: string; type: string; titel: string; wat: string; waarom: string; uitkomst: string; link: string; trend_id: string | null };
export type Team = { id: string; naam: string; mijnRol: string };
export type Lid = { user_id: string; naam: string; rol: string; teamrol: string; nul: number | null; nu: number | null };
export type PubliekProfiel = { profiel: Pick<Profile, "naam" | "rol" | "agency" | "toon">; zin: string; verschuiving: number[]; kaarten: Exp[] };

export type Data = {
  profile: Profile | null;
  scans: Scan[];
  inv: Invalshoek;
  versies: Versie[];
  exps: Exp[];
  teamIds: string[];
  adm: Administratie;
  metingen: Meting[];
  portfolio: string[];
  eind: Eind;
  beoordeling: Beoordeling | null; // alleen zichtbaar na vaststelling
  magBeoordelen: boolean;
  klanten: Klant[];
  taken: Taak[];
  koppelingen: Koppeling[];
  bouw: Bouw;
  watch: string[];
  trends: Trend[];
  zetten: Zet[];
  team: Team | null;
  isBeheer: boolean;
};

export type Sessie = { id: string; email: string };

export const leegExp = (): Omit<Exp, "id"> => ({
  team_id: null, auteur: "", klant: "", titel: "", signaal: "", waarom: "", hypothese: "", keuze: "",
  bouw: "", tool: "", spec: "", link: "", meting: "", uitkomst: "", geleerd: "", zichtbaarheid: "prive",
  status: "bezig", remix_titel: null, remix_auteur: null, bron_tool: null, week: 1,
  datum: new Date().toISOString().slice(0, 10),
});
export const leegData = (): Data => ({
  profile: null, scans: [], inv: { vak: "", buiten: "", voorwie: "", zin: "" }, versies: [], exps: [], teamIds: [], adm: leegAdm(),
  metingen: [], portfolio: [], eind: { pitch_link: "", reflectie: "", ingediend_op: null }, beoordeling: null, magBeoordelen: false, klanten: [], taken: [], koppelingen: [],
  bouw: { gedaan: [], velden: {}, spec: "" }, watch: [], trends: [], zetten: [], team: null, isBeheer: false,
});
