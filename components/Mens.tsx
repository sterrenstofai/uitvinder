"use client";
// Bewegend beeld op de voorkant. Speelt zonder geluid en in een lus; wie
// beweging heeft uitgezet in het systeem, ziet het stilstaande beeld.
import { useEffect, useRef } from "react";

// Zet op false om alleen het stilstaande beeld te tonen.
const HEEFT_VIDEO = true;

export function Mens() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !HEEFT_VIDEO || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => {});
  }, []);
  return (
    <div className="mens">
      <video ref={ref} muted loop playsInline preload="metadata" poster="/beeld/maker-poster.jpg" aria-label="Een ontwerper schetst een idee naast haar laptop">
        {HEEFT_VIDEO && <source src="/beeld/maker.mp4" type="video/mp4" />}
      </video>
    </div>
  );
}
