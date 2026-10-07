import type { Metadata } from "next";
import { Newsreader, Public_Sans } from "next/font/google";
import "@/styles/globals.css";

const display = Newsreader({ subsets: ["latin"], variable: "--font-display" });
const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "Hillshome Tours Company LTD", template: "%s | Hillshome Tours Company LTD" },
  description: "Transport, construction, cleaning and maintenance, IT, multimedia and tours from one company.",
  openGraph: { type: "website", siteName: "Hillshome Tours Company LTD" },
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
