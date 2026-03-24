interface SectionHeaderProps {
  eyebrow: string;
  heading: string;
  description?: string;
  align?: "left" | "center";
  descriptionMaxWidth?: string;
}

export default function SectionHeader({
  eyebrow,
  heading,
  description,
  align = "left",
  descriptionMaxWidth = "480px",
}: SectionHeaderProps) {
  const center = align === "center";

  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: "24px" }}>
      <div style={{
        fontSize: "11px",
        fontWeight: 500,
        color: "#E8934A",
        letterSpacing: "1.4px",
        textTransform: "uppercase",
        marginBottom: "8px",
      }}>
        {eyebrow}
      </div>
      <h2 style={{
        fontSize: "22px",
        fontWeight: 500,
        color: "var(--text-primary)",
        marginBottom: description ? "8px" : 0,
        lineHeight: 1.2,
      }}>
        {heading}
      </h2>
      {description && (
        <p style={{
          fontSize: "14px",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          maxWidth: descriptionMaxWidth,
          ...(center ? { margin: "0 auto" } : {}),
        }}>
          {description}
        </p>
      )}
    </div>
  );
}
