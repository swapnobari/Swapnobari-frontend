import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const enAccent = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-en-accent",
  display: "swap",
});

const enUi = Inter({
  subsets: ["latin"],
  variable: "--font-en-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Swapno Bari Housing Ltd. | Turning dreams into reality",
  description:
    "Swapno Bari Housing Ltd. is a trusted real estate company in Dhaka, Bangladesh, building modern apartments and land projects.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${enAccent.variable} ${enUi.variable}`}>
      <body>{children}</body>
    </html>
  );
}