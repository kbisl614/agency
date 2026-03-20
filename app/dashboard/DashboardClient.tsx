"use client";

export default function DashboardClient({
  businessName,
  firstName,
}: {
  businessName: string;
  firstName: string | null;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#0f1923", fontFamily: "'Open Sans', sans-serif", color: "#e8ddd0" }}>
      <p style={{ padding: 32 }}>Dashboard loading... {businessName}</p>
    </div>
  );
}
