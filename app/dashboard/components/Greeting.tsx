"use client";

import { useMemo } from "react";

export default function Greeting({ firstName }: { firstName: string | null }) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "You're up late";
  }, []);

  const nameStr = firstName ? `, ${firstName}` : "";

  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 500, color: "#e8ddd0", lineHeight: 1.3 }}>
        {greeting}{nameStr}.
      </div>
      <div style={{ fontSize: 14, color: "#6a7d8e", marginTop: 6 }}>
        Everything your agents are doing.
      </div>
    </div>
  );
}
