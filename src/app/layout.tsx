import type { Metadata, Viewport } from "next";
import "./globals.css";
import { wedding } from "@/content/wedding";

export const metadata: Metadata = {
  title: `${wedding.couple.first} & ${wedding.couple.second}`,
  description: `${wedding.dateLabel} · ${wedding.place}`,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0b1533", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&family=Pinyon+Script&family=IBM+Plex+Mono:wght@400;500&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
