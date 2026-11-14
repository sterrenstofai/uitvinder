// Afgeleiden, één op één uit het prototype.
import type { Data, Exp } from "./types";

export const vandaagISO = () => new Date().toISOString().slice(0, 10);
export const fmtD = (d: string) =>
  new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
export const slugify = (s: string) =>
  String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "profiel";
export const initials = (n: string) =>
  String(n || "?").trim().split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

export const nul = (d: Data) => d.scans[0];
export const laatste = (d: Data) => d.scans[d.scans.length - 1];
export const weekNr = (d: Data) =>
  d.scans[0] ? Math.floor((Date.now() - new Date(d.scans[0].datum).getTime()) / 6048e5) + 1 : 1;
export const expTitel = (e: Pick<Exp, "titel" | "hypothese" | "signaal">) =>
  e.titel ||
  (e.hypothese ? e.hypothese.slice(0, 70) + (e.hypothese.length > 70 ? "…" : "") : e.signaal ? e.signaal.slice(0, 70) : "Nieuw experiment");
export const curExp = (d: Data) => d.exps.find((e) => e.status === "bezig");
export const afgerond = (d: Data) => d.exps.filter((e) => e.status === "af");
export const METINGWEKEN = [1, 6, 12];
