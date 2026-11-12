import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site-url";

const body = Plus_Jakarta_Sans({ variable: "--font-body", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-head", subsets: ["latin"], weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Whitsunday Junk Removal | Rubbish Removal Airlie Beach, Cannonvale & Proserpine",
    template: "%s | Whitsunday Junk Removal",
  },
  description:
    "Fast, local junk and rubbish removal across the Whitsundays. House cleanouts, end-of-lease, green waste, furniture and commercial clear-outs. Fixed load pricing from $180.",
  openGraph: { type: "website", locale: "en_AU", siteName: "Whitsunday Junk Removal" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0b2545",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={`${body.variable} ${display.variable} h-full antialiased`}>
      <head>
        {/* Scroll animations only hide content once JavaScript is running, so crawlers see everything */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
