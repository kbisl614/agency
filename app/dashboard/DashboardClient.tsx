"use client";

import NavBar from "./components/NavBar";
import Greeting from "./components/Greeting";
import ApprovalInbox from "./components/ApprovalInbox";
import StatsRow from "./components/StatsRow";

export default function DashboardClient({
  businessName,
  firstName,
}: {
  businessName: string;
  firstName: string | null;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#0f1923", fontFamily: "'Open Sans', sans-serif", color: "#e8ddd0" }}>
      <NavBar businessName={businessName} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 28px", display: "flex", flexDirection: "column", gap: 30 }}>
        <Greeting firstName={firstName} />
        <ApprovalInbox />
        <StatsRow />
        {/* sections mount here in subsequent tasks */}
      </div>
    </div>
  );
}
