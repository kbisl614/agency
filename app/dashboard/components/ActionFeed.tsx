"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ActionItem {
  id: string;
  description: string;
  status: string;
  action_type: string;
  agent_name: string;
  created_at: string;
}

type Tab = "needs_attention" | "completed";

const DOT_COLOR: Record<string, string> = {
  auto_executed: "#4ade80",
  human_approved: "#4ade80",
  awaiting_customer: "#e8934a",
  human_review: "#e8934a",
  jobber_synced: "#60a5fa",
  human_skipped: "#3d5068",
  failed: "#E8756A",
};

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  const d = new Date(iso);
  const yesterday = new Date(Date.now() - 86400000);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} at ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

export default function ActionFeed() {
  const [tab, setTab] = useState<Tab>("needs_attention");
  const [attentionItems, setAttentionItems] = useState<ActionItem[]>([]);
  const [completedItems, setCompletedItems] = useState<ActionItem[]>([]);
  const [attentionExpanded, setAttentionExpanded] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [error, setError] = useState(false);
  const seenIds = useRef<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const fetchTab = useCallback(async (t: Tab) => {
    try {
      const res = await fetch(`/api/dashboard/actions?tab=${t}`);
      if (!res.ok) throw new Error();
      const data: ActionItem[] = await res.json();

      // Track net-new for fade-in
      const incoming = new Set(data.map((a) => a.id));
      const fresh = new Set<string>();
      incoming.forEach((id) => { if (!seenIds.current.has(id)) fresh.add(id); });
      data.forEach((a) => seenIds.current.add(a.id));
      if (fresh.size > 0) {
        setNewIds((prev) => new Set([...prev, ...fresh]));
        setTimeout(() => setNewIds((prev) => { const s = new Set(prev); fresh.forEach((id) => s.delete(id)); return s; }), 300);
      }

      if (t === "needs_attention") setAttentionItems(data);
      else setCompletedItems(data);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchTab("needs_attention");
    fetchTab("completed");
    // 10-second polling for normal updates
    const interval = setInterval(() => {
      fetchTab("needs_attention");
      fetchTab("completed");
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchTab]);


  function renderRows(items: ActionItem[], defaultCount: number, expanded: boolean, setExpanded: (v: boolean) => void) {
    const visible = expanded ? items : items.slice(0, defaultCount);
    const hiddenCount = items.length - defaultCount;

    if (items.length === 0) {
      return tab === "needs_attention" ? (
        <div style={{ color: "#4a5e70", fontSize: 13, padding: "16px 0" }}>
          Nothing needs your attention right now.
        </div>
      ) : (
        <div style={{ padding: "16px 0" }}>
          <div style={{ color: "#4a5e70", fontSize: 13 }}>No completed actions yet today.</div>
          <div style={{ color: "#4a5e70", fontSize: 13, marginTop: 4 }}>Your agents are standing by.</div>
        </div>
      );
    }

    return (
      <>
        {visible.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "14px 0", borderBottom: "1px solid #0d1420",
              opacity: newIds.has(item.id) ? 0 : 1,
              transition: "opacity 0.3s ease",
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5,
              background: DOT_COLOR[item.status] ?? "#3d5068",
              display: "inline-block",
            }} />
            <div style={{ flex: 1, fontSize: 13, color: "#9aaabb", lineHeight: 1.7 }}>
              {item.description}
            </div>
            <div style={{ fontSize: 12, color: "#2e3f50", whiteSpace: "nowrap", paddingTop: 3 }}>
              {relativeTime(item.created_at)}
            </div>
          </div>
        ))}

        {!expanded && hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            style={{
              background: "none", border: "none", color: "#4a5e70",
              fontSize: 12, cursor: "pointer", padding: "10px 0 2px",
              display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.3px",
            }}
          >
            <span style={{ fontSize: 16, letterSpacing: 2, color: "#354555" }}>···</span>
            {hiddenCount} more {tab === "needs_attention" ? "things need attention" : "completed actions"}
          </button>
        )}
        {expanded && items.length > defaultCount && (
          <button
            onClick={() => setExpanded(false)}
            style={{
              background: "none", border: "none", color: "#4a5e70",
              fontSize: 12, cursor: "pointer", padding: "10px 0 2px",
            }}
          >
            Show less
          </button>
        )}
      </>
    );
  }

  if (error) {
    return <div style={{ color: "#6a7d8e", fontSize: 13 }}>Couldn&apos;t load this section — will retry shortly</div>;
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 24, marginBottom: 16, borderBottom: "1px solid #1a2d42" }}>
        {(["needs_attention", "completed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 500,
              color: tab === t ? "#e8ddd0" : "#4a5e70",
              padding: "0 0 12px",
              borderBottom: tab === t ? "2px solid #e8934a" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t === "needs_attention" ? "Needs attention" : "Completed today"}
          </button>
        ))}
      </div>

      {tab === "needs_attention"
        ? renderRows(attentionItems, 3, attentionExpanded, setAttentionExpanded)
        : renderRows(completedItems, 5, completedExpanded, setCompletedExpanded)}
    </div>
  );
}
