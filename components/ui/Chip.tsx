import { ReactNode } from "react";

type ChipVariant = "green" | "orange" | "blue" | "gray" | "red";

interface ChipProps {
  variant: ChipVariant;
  children: ReactNode;
}

const styles: Record<ChipVariant, { background: string; color: string }> = {
  green:  { background: "#E6F4EC", color: "#1A7A4A" },
  orange: { background: "#FEF0E6", color: "#C05C1E" },
  blue:   { background: "#E6F0FE", color: "#2563EB" },
  gray:   { background: "#F0EBE3", color: "#6A7D8E" },
  red:    { background: "#FEE6E6", color: "#C0392B" },
};

export default function Chip({ variant, children }: ChipProps) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: "10px",
      fontWeight: 500,
      padding: "2px 7px",
      borderRadius: "4px",
      ...styles[variant],
    }}>
      {children}
    </span>
  );
}
