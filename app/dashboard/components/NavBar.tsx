"use client";

export default function NavBar({ businessName }: { businessName: string }) {
  return (
    <nav style={{
      background: "#111e2e",
      borderBottom: "1px solid #1a2d42",
      padding: "16px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, color: "#e8ddd0" }}>
        <div style={{
          width: 28, height: 28, background: "#e8934a", borderRadius: 5,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>F</div>
        Fieldline AI
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 13, color: "#6a7d8e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4ade80" }}>
          <span style={{
            width: 7, height: 7, background: "#4ade80", borderRadius: "50%",
            flexShrink: 0,
            animation: "fieldline-pulse 2s infinite",
          }} />
          All agents active
        </div>
        <span>{businessName}</span>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" style={{
            background: "none", border: "none", color: "#354555",
            cursor: "pointer", fontSize: 13, padding: 0,
          }}>Sign out</button>
        </form>
      </div>
    </nav>
  );
}
