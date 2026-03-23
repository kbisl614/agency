import { CSSProperties, ReactNode } from "react";

type ButtonVariant = "primary" | "dark" | "muted" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
  style?: CSSProperties;
}

const base: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "inherit",
  fontWeight: 500,
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  transition: "opacity 0.15s ease",
  lineHeight: 1,
};

const variants: Record<ButtonVariant, CSSProperties> = {
  primary: { background: "#E8934A", color: "#fff" },
  dark:    { background: "#C05C1E", color: "#fff" },
  muted:   { background: "#F0EBE3", color: "#1A2535", border: "none" },
  ghost:   { background: "none", color: "#9AAABB", textDecoration: "underline", border: "none" },
  outline: { background: "transparent", color: "#6A7D8E", border: "0.5px solid #E8DDD0" },
};

const sizes: Record<ButtonSize, CSSProperties> = {
  sm: { fontSize: "12px", padding: "7px 14px" },
  md: { fontSize: "13px", padding: "10px 20px" },
  lg: { fontSize: "14px", padding: "11px 24px" },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...base,
        ...variants[variant],
        ...sizes[size],
        ...(fullWidth ? { width: "100%" } : {}),
        ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}
