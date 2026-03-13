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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dispachhvac.ai"),
  title: "HVAC Dispatch Automation | Capture Emergency Calls at 2 AM",
  description:
    "AI-powered autonomous revenue system for HVAC contractors. Capture 100% of leads in <30 seconds. Fill cancellations instantly. Handle 80% of dispatcher work. Works on Jobber & ServiceTitan. 30-day free trial.",
  keywords: [
    "HVAC dispatch automation",
    "emergency lead capture",
    "HVAC AI",
    "contractor dispatch software",
    "Jobber integration",
    "ServiceTitan integration",
    "HVAC cancellation recovery",
    "HVAC emergency calls",
  ],
  authors: [{ name: "Dispatch HVAC" }],
  creator: "Dispatch HVAC",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dispachhvac.ai",
    siteName: "Dispatch HVAC",
    title: "HVAC Dispatch Automation | Capture Every Emergency Call",
    description:
      "Your HVAC business running at 2 AM without you. Capture emergency leads in <30 seconds. Fill cancellations while you sleep. No dispatcher needed.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HVAC Emergency Lead Capture & Dispatch Automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Dispatch Automation | Capture Emergency Calls at 2 AM",
    description:
      "AI handles your emergency leads, cancellations, and dispatch 24/7. Works on Jobber & ServiceTitan.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
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
