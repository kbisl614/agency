"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Metrics {
  revenue_mtd: number;
  retainer_amount: number;
  leads_recovered: number;
  leads_guarantee: number;
  avg_response_ms: number;
  actions_today: number;
  last_updated: string;
}

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (target === 0 || hasAnimated.current) return;
    hasAnimated.current = true;
    const start = performance.now();
    function frame(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just updated";
  const mins = Math.floor(diff / 60);
  return `Last updated ${mins} min ago`;
}

export default function StatsRow() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [lastUpdatedDisplay, setLastUpdatedDisplay] = useState("");
  const [error, setError] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/metrics");
      if (!res.ok) throw new Error();
      const data: Metrics = await res.json();
      setMetrics(data);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    // 10-second polling for normal updates
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  // Separate 30-second retry when in error state
  useEffect(() => {
    if (!error) return;
    const retryInterval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(retryInterval);
  }, [error, fetchMetrics]);

  useEffect(() => {
    if (!metrics) return;
    setLastUpdatedDisplay(timeAgo(metrics.last_updated));
    const tick = setInterval(() => setLastUpdatedDisplay(timeAgo(metrics.last_updated)), 30000);
    return () => clearInterval(tick);
  }, [metrics]);

  const animatedRevenue = useCountUp(metrics?.revenue_mtd ?? 0);

  if (error) {
    return <div style={{ color: "#6a7d8e", fontSize: 13 }}>Couldn't load stats — will retry shortly</div>;
  }

  if (!metrics) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: "1 1 200px", background: "#111e2e", border: "1px solid #1a2d42", borderRadius: 8, padding: 20, minHeight: 90 }} />
        ))}
      </div>
    );
  }

  const isEmpty = metrics.revenue_mtd === 0 && metrics.actions_today === 0;

  if (isEmpty) {
    return (
      <div style={{ background: "#111e2e", border: "1px solid #1a2d42", borderRadius: 8, padding: "28px 20px", textAlign: "center" }}>
        <div style={{ color: "#9aaabb", fontSize: 14, marginBottom: 6 }}>Your system is live and standing by.</div>
        <div style={{ color: "#4a5e70", fontSize: 13 }}>Actions will appear here as your agents get to work.</div>
      </div>
    );
  }

  const ahead = metrics.revenue_mtd - metrics.retainer_amount;
  const leadsLeft = metrics.leads_guarantee - metrics.leads_recovered;
  const avgSecs = Math.round(metrics.avg_response_ms / 1000);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {/* Revenue */}
        <div style={{ flex: "1 1 200px", background: "#111e2e", border: "1px solid #1a2d42", borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 12, color: "#4a5e70", marginBottom: 10, fontWeight: 500 }}>Money recovered this month</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e8934a", lineHeight: 1 }}>${animatedRevenue.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: ahead >= 0 ? "#4ade80" : "#354555", marginTop: 7 }}>
            {ahead >= 0 ? `$${ahead.toLocaleString()} ahead of your retainer` : `$${Math.abs(ahead).toLocaleString()} behind retainer`}
          </div>
        </div>
        {/* Leads */}
        <div style={{ flex: "1 1 200px", background: "#111e2e", border: "1px solid #1a2d42", borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 12, color: "#4a5e70", marginBottom: 10, fontWeight: 500 }}>Missed calls answered</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e8ddd0", lineHeight: 1 }}>{metrics.leads_recovered}</div>
          <div style={{ fontSize: 12, color: "#354555", marginTop: 7 }}>
            {leadsLeft <= 0 ? "Guarantee met ✓" : `${leadsLeft} more to hit your guarantee`}
          </div>
        </div>
        {/* Response time */}
        <div style={{ flex: "1 1 200px", background: "#111e2e", border: "1px solid #1a2d42", borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 12, color: "#4a5e70", marginBottom: 10, fontWeight: 500 }}>Average response time</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#4ade80", lineHeight: 1 }}>{avgSecs}s</div>
          <div style={{ fontSize: 12, color: "#354555", marginTop: 7 }}>Industry average is 8 hours</div>
        </div>
      </div>
      <div style={{ textAlign: "right", fontSize: 11, color: "#354555", marginTop: 8 }}>
        {lastUpdatedDisplay}
      </div>
    </div>
  );
}
