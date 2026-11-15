"use client";
// Bewegend beeld op de voorkant. Speelt zonder geluid en in een lus; wie
// beweging heeft uitgezet in het systeem, ziet het stilstaande beeld.
import { useEffect, useRef } from "react";

// Zet op true zodra public/beeld/maker.mp4 bestaat. Tot dan staat het stilstaande beeld er.
const HEEFT_VIDEO = false;

export function Mens() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !HEEFT_VIDEO || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => {});
  }, []);
  return (
    <div className="mens">
      <video ref={ref} muted loop playsInline preload="metadata" poster="/beeld/maker.jpg" aria-label="Een jonge maker zit ontspannen op de grond tegen een bank, met een laptop op schoot">
        {HEEFT_VIDEO && <source src="/beeld/maker.mp4" type="video/mp4" />}
      </video>
    </div>
  );
}
