"use client";

import { useState, useEffect, useCallback } from "react";

interface InboxItem {
  id: string;
  description: string;
  revenue_impact: number | null;
  confidence_score: number | null;
  created_at: string;
  action_type: string;
}

const COUNT_WORDS: Record<number, string> = {
  1: "One thing needs your approval",
  2: "Two things need your approval",
  3: "Three things need your approval",
  4: "Four things need your approval",
  5: "Five things need your approval",
};

function getApproveLabel(action_type: string): string {
  if (action_type.includes("schedule") || action_type.includes("book")) return "Yes, book it";
  if (action_type.includes("proposal") || action_type.includes("sms") || action_type.includes("send")) return "Yes, send it";
  return "Yes, do it";
}

export default function ApprovalInbox() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [fadingOut, setFadingOut] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(false);

  const fetchInbox = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/inbox");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchInbox();
    // 10-second polling for normal updates
    const interval = setInterval(fetchInbox, 10000);
    return () => clearInterval(interval);
  }, [fetchInbox]);

  // Separate 30-second retry when in error state
  useEffect(() => {
    if (!error) return;
    const retryInterval = setInterval(fetchInbox, 30000);
    return () => clearInterval(retryInterval);
  }, [error, fetchInbox]);

  async function handleDecision(id: string, decision: "approved" | "skipped") {
    setFadingOut((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setFadingOut((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }, 400);
    try {
      await fetch("/api/dashboard/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_id: id, decision }),
      });
    } catch { /* fire-and-forget */ }
  }

  if (error) {
    return (
      <div style={{ color: "#6a7d8e", fontSize: 13 }}>
        Couldn&apos;t load approvals — will retry shortly
      </div>
    );
  }

  const visibleItems = expanded ? items : items.slice(0, 3);
  const hiddenCount = items.length - 3;
  const headerText = items.length >= 6
    ? "5+ things need your approval"
    : COUNT_WORDS[items.length] ?? `${items.length} things need your approval`;

  return (
    <div style={{
      background: "#0d1420",
      border: "1px solid rgba(232,147,74,0.33)",
      borderRadius: 8,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: items.length === 0 ? "none" : "1px solid rgba(232,147,74,0.13)",
      }}>
        {items.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#4ade80", fontSize: 14 }}>✓</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#e8ddd0" }}>You&apos;re all caught up.</div>
              <div style={{ fontSize: 12, color: "#6a7d8e", marginTop: 2 }}>Nothing needs your attention right now.</div>
            </div>
          </div>
        ) : (
          <>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#e8934a" }}>{headerText}</span>
            <span style={{ fontSize: 11, color: "#6a7d8e" }}>Takes 10 seconds</span>
          </>
        )}
      </div>

      {visibleItems.map((item) => (
        <div
          key={item.id}
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(232,147,74,0.09)",
            display: "flex", alignItems: "center", gap: 16,
            opacity: fadingOut.has(item.id) ? 0.3 : 1,
            transition: "opacity 0.4s ease",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#e8ddd0" }}>{item.description}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            {item.revenue_impact != null && item.revenue_impact > 0 && (
              <div style={{ fontSize: 16, fontWeight: 600, color: "#e8934a", whiteSpace: "nowrap" }}>
                ${item.revenue_impact.toLocaleString()}
              </div>
            )}
            <div style={{ display: "flex", gap: 7 }}>
              <button
                onClick={() => handleDecision(item.id, "approved")}
                style={{
                  background: "#0f2a18", color: "#4ade80",
                  border: "1px solid #1a4a28", padding: "7px 16px",
                  borderRadius: 6, fontSize: 12, cursor: "pointer",
                  fontWeight: 500, whiteSpace: "nowrap",
                  minHeight: 44, minWidth: 80,
                }}
              >
                {getApproveLabel(item.action_type)}
              </button>
              <button
                onClick={() => handleDecision(item.id, "skipped")}
                style={{
                  background: "transparent", color: "#4a5e70",
                  border: "1px solid #1a2d42", padding: "7px 16px",
                  borderRadius: 6, fontSize: 12, cursor: "pointer",
                  whiteSpace: "nowrap", minHeight: 44, minWidth: 80,
                }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      ))}

      {!expanded && hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            background: "none", border: "none", color: "#4a5e70",
            fontSize: 12, cursor: "pointer", padding: "10px 20px 12px",
            display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.3px",
          }}
        >
          <span style={{ fontSize: 16, letterSpacing: 2, color: "#354555" }}>···</span>
          {hiddenCount} more to review
        </button>
      )}
    </div>
  );
}
