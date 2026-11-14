export const ROLLEN = ["designer", "copywriter", "marketeer", "strateeg", "anders"] as const;
export type Rol = (typeof ROLLEN)[number];
export type Zichtbaarheid = "prive" | "team" | "publiek";

export type Profile = { id: string; naam: string; rol: Rol; agency: string | null; ondernemer: boolean; slug: string | null };

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

export type Data = {
  profile: Profile | null;
  scans: Scan[];
  inv: Invalshoek;
  versies: Versie[];
  exps: Exp[];
  teamIds: string[];
};

export type Sessie = { id: string; email: string };

export const leegExp = (): Omit<Exp, "id"> => ({
  team_id: null, auteur: "", klant: "", titel: "", signaal: "", waarom: "", hypothese: "", keuze: "",
  bouw: "", tool: "", spec: "", link: "", meting: "", uitkomst: "", geleerd: "", zichtbaarheid: "prive",
  status: "bezig", remix_titel: null, remix_auteur: null, bron_tool: null, week: 1,
  datum: new Date().toISOString().slice(0, 10),
});
export const leegData = (): Data => ({
  profile: null, scans: [], inv: { vak: "", buiten: "", voorwie: "", zin: "" }, versies: [], exps: [], teamIds: [],
});
