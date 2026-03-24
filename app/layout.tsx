import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fieldline AI — AI Operations for HVAC Contractors",
  description:
    "We map where your HVAC business is losing money, build the AI that fixes it, and run it. Discovery call first. Custom-built for your operation.",
  authors: [{ name: "Fieldline AI" }],
  keywords: [
    "HVAC AI operations",
    "HVAC contractor automation",
    "AI for HVAC",
    "Jobber AI",
    "ServiceTitan AI",
    "HVAC lead recovery",
    "HVAC dispatch automation",
  ],
  creator: "Fieldline AI",
  robots: "index, follow",
  openGraph: {
    title: "Fieldline AI — AI Operations for HVAC Contractors",
    description:
      "Custom AI built for your HVAC operation. We map your bottlenecks, build the system, and run it. Discovery call first.",
    url: "https://fieldlineai.com",
    siteName: "Fieldline AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fieldline AI — AI Operations for HVAC Contractors",
    description:
      "Custom AI built for your HVAC operation. We map your bottlenecks, build the system, and run it.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
