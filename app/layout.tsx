import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppProvider } from "@/components/app";
import "./globals.css";

export const metadata: Metadata = {
  title: "Van uitvoerder naar uitvinder — Thijs Mensink",
  description:
    "AI neemt het uitvoerende werk in marketing over. Van uitvoerder naar uitvinder is de reis naar een rol die blijft: zelf de brief meebrengen, bouwen, meten.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 79 94'%3E%3Cpath fill='%23ff8a5c' d='M79 29.5V0H0v29.5S-1.2 80.2 39.3 94h.4C80.2 80.2 79 29.5 79 29.5z'/%3E%3C/svg%3E",
  },
};
// Altijd licht, ook als het systeem op donker staat.
export const viewport: Viewport = { themeColor: "#f7f5f2", colorScheme: "only light", viewportFit: "cover" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://thijsmensink.nl" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@500;600&display=swap" />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
