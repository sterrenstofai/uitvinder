"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./app";
import { initials } from "@/lib/afgeleid";
import { APPNAV } from "@/lib/nav";

export function Kop({ nav = true }: { nav?: boolean }) {
  const { data, sessie, modus } = useApp();
  const pad = usePathname();
  const route = pad.split("/")[1] || "";
  const actief = route === "volgt" ? pad.split("/")[2] : ["ronde", "invalshoek", "rolscan", "meting"].includes(route) ? "reis" : route === "certificaat" ? "portfolio" : route;
  const naam = data.profile?.naam;
  return (
    <header className="top">
      <div className="wrap wide">
        <Link className="brand" href={sessie ? "/vandaag" : "/"}>
          <span className="dotm" aria-hidden="true"></span>
          <span className="wm">Uitvinder</span>
          <span className="by">door Thijs Mensink</span>
        </Link>
        <span className="who">
          {modus === "lokaal" && <span className="proto">Voorbeeldmodus</span>}
          {naam ? (
            <Link href="/volgt/profiel" className="av-s" aria-label={`Profiel van ${naam}`}>{initials(naam)}</Link>
          ) : (
            !sessie && <Link className="btn sm" href="/login">Log in</Link>
          )}
        </span>
      </div>
      {nav && naam && (
        <nav className="wrap wide nav" aria-label="Platform">
          {/* Voor ondernemers staat Administratie vooraan, direct na Vandaag. */}
          {[APPNAV[0], ...(data.profile?.ondernemer ? ([["administratie", "Administratie", true]] as typeof APPNAV) : []), ...APPNAV.slice(1), ...(data.magBeoordelen ? ([["beoordelen", "Beoordelen", true]] as typeof APPNAV) : [])].map(([r, t, staat]) => (
            <Link key={r} href={staat ? `/${r}` : `/volgt/${r}`} aria-current={r === actief ? "page" : undefined}>{t}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Voet() {
  const { modus, sessie, logout } = useApp();
  return (
    <footer className="foot">
      <div className="wrap wide">
        <div>
          <div className="motto">Kan niet, bestaat niet!</div>
          <p className="hint" style={{ marginTop: 10 }}>Thijs Mensink, The Netherlands</p>
        </div>
        <p className="hint">
          {modus === "lokaal" ? "Voorbeeldmodus. Gegevens blijven op dit apparaat." : "Je gegevens staan in de EU."}
          {sessie && (
            <>
              {" "}
              <button className="lnk" onClick={() => logout().then(() => (location.href = "/"))}>Log uit</button>
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
