import type { Metadata, Viewport } from "next";
import { Cinzel, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Cinzel({ subsets: ["latin"], variable: "--f-display", weight: ["500", "700", "900"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--f-mono" });

export const metadata: Metadata = { title: "GOMEZ.EXE | Software Engineer", description: "Portfolio of Gomez, Software Engineer." };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#07060b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
