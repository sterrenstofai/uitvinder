"use client";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/components/app";
import { Kop, Voet } from "@/components/Kop";

// Alles hierbinnen vraagt een account en een profiel.
export default function Besloten({ children }: { children: ReactNode }) {
  const { klaar, sessie, data } = useApp();
  const router = useRouter();
  const pad = usePathname();
  const heeftProfiel = Boolean(data.profile?.naam);
  const opStart = pad === "/start";
  const doel = !klaar ? null : !sessie ? "/login" : !heeftProfiel && !opStart ? "/start" : heeftProfiel && opStart ? "/vandaag" : null;

  useEffect(() => {
    if (doel) router.replace(doel);
  }, [doel, router]);

  return (
    <>
      <Kop />
      {klaar && !doel ? children : <main className="wrap" style={{ minHeight: "60vh" }} aria-busy="true" />}
      <Voet />
    </>
  );
}
