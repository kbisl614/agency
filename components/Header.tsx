"use client";

import { useState } from "react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <header style={{ background: "var(--bg-primary)", borderBottom: "0.5px solid var(--border-subtle)" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px" }}>
        <span style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
          Fieldline AI
        </span>

        {/* Desktop */}
        <div className="hidden md:flex" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <button onClick={() => scrollTo("#how-it-works")} style={{ fontSize: "13px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}>
            How it works
          </button>
          <button
            onClick={() => scrollTo("#book-call")}
            style={{ fontSize: "13px", background: "#C05C1E", color: "#fff", border: "none", padding: "7px 16px", borderRadius: "6px", cursor: "pointer" }}
          >
            Book a call
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div style={{ padding: "12px 32px 20px", borderTop: "0.5px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <button onClick={() => scrollTo("#how-it-works")} style={{ fontSize: "13px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
            How it works
          </button>
          <button
            onClick={() => scrollTo("#book-call")}
            style={{ fontSize: "13px", background: "#C05C1E", color: "#fff", border: "none", padding: "9px 16px", borderRadius: "6px", cursor: "pointer", textAlign: "left" }}
          >
            Book a call
          </button>
        </div>
      )}
    </header>
  );
}
