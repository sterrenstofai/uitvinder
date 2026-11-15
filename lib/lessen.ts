// De lessen komen uit content/*.md en nergens anders vandaan.
// Dit bestand draait alleen op de server, bij de build.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";

export type Les = {
  titel: string;
  inleiding: string; // html
  secties: { kop: string; html: string }[];
  rol: Record<string, string>; // html per rol
};

const BESTAND: Record<number, string> = {
  2: "stap-2-invalshoek.md",
  3: "stap-3-relevantie.md",
  4: "stap-4-uitvinden.md",
  5: "stap-5-zichtbaar.md",
};
// Niet voor de deelnemer: aanwijzingen voor de coach en de beschrijving van de proeftuin.
const OVERSLAAN = /^(wat de coach controleert|proeftuin)/i;

const html = (md: string) => marked.parse(md.trim(), { async: false }) as string;

export function leesLes(stap: number): Les {
  const bestand = BESTAND[stap];
  let md: string;
  try {
    md = readFileSync(join(process.cwd(), "content", bestand), "utf8");
  } catch {
    return { titel: `Stap ${stap}`, inleiding: "<p>[INHOUD VOLGT]</p>", secties: [], rol: {} };
  }
  const [kop, ...delen] = md.split(/^## /m);
  const titel = (kop.match(/^# (.+)$/m)?.[1] || "").replace(/^Stap \d+\s*[—-]\s*/, "").trim();
  const les: Les = { titel, inleiding: "", secties: [], rol: {} };
  for (const deel of delen) {
    const nl = deel.indexOf("\n");
    const naam = deel.slice(0, nl).trim();
    const tekst = deel.slice(nl + 1);
    if (OVERSLAAN.test(naam)) continue;
    if (/^de les/i.test(naam)) les.inleiding = html(tekst);
    else if (/^voorbeeld per rol/i.test(naam)) {
      for (const alinea of tekst.split(/\n\s*\n/)) {
        const m = alinea.trim().match(/^\*\*([^*]+)\*\*\s*([\s\S]+)$/);
        if (m) les.rol[m[1].trim().toLowerCase().replace(/[^a-z]+$/, "")] = html(m[2]);
      }
    } else les.secties.push({ kop: naam, html: html(tekst) });
  }
  return les;
}

// Inhoud van het scherm Administratie (voor ondernemers), uit content/administratie.md.
// Een placeholder ([INHOUD VOLGT]) wordt niet getoond: dan staat alleen de titel er.
export type AdmInhoud = {
  inleiding: string | null;
  potjes: string | null;
  groepen: { kop: string; items: { id: string; titel: string; html: string | null }[] }[];
};

const gevuld = (md: string) => (md.trim() && !/\[INHOUD VOLGT\]/.test(md) ? html(md) : null);
const sleutel = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function leesAdministratie(): AdmInhoud {
  let md: string;
  try {
    md = readFileSync(join(process.cwd(), "content", "administratie.md"), "utf8");
  } catch {
    return { inleiding: null, potjes: null, groepen: [] };
  }
  const deel = (naam: string) => md.split(/^## /m).find((d) => d.toLowerCase().startsWith(naam))?.replace(/^.*\n/, "") ?? "";
  const groepen = deel("checklist")
    .split(/^### /m)
    .slice(1)
    .map((g) => ({
      kop: g.slice(0, g.indexOf("\n")).trim(),
      items: [...g.matchAll(/^- \*\*(.+?)\*\*\s*(.*)$/gm)].map((m) => {
        const titel = m[1].replace(/\.$/, "");
        return { id: sleutel(titel), titel, html: gevuld(m[2]) };
      }),
    }));
  return { inleiding: gevuld(deel("inleiding")), potjes: gevuld(deel("bij de potjes")), groepen };
}

// Uitleg van de reis, de toetsing en de metingen, uit content/zo-werkt-het.md.
export function leesZoWerktHet(): string | null {
  try {
    const md = readFileSync(join(process.cwd(), "content", "zo-werkt-het.md"), "utf8");
    const vanaf = md.search(/^## /m);
    return vanaf < 0 ? null : html(md.slice(vanaf).replace(/^## /gm, "#### "));
  } catch {
    return null;
  }
}
