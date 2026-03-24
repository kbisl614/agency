// Paste this metadata export into your app/layout.tsx
// Replace the existing metadata export — leave everything else in layout.tsx unchanged

import type { Metadata } from "next";

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
