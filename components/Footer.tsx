export default function Footer() {
  return (
    <footer style={{ background: "#111E2E", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
      <span style={{ fontSize: "12px", color: "#6A7D8E" }}>Fieldline AI · Cedar Rapids, IA</span>
      <span style={{ fontSize: "11px", background: "#1F3044", color: "#E8934A", borderRadius: "4px", padding: "3px 8px" }}>
        $1,500/mo after trial
      </span>
    </footer>
  );
}
