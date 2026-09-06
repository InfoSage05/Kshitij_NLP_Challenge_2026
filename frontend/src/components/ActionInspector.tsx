"use client";

import React, { useState } from "react";

interface ActionInspectorProps {
  payload: Record<string, any> | null;
  onClear: () => void;
}

export const ActionInspector: React.FC<ActionInspectorProps> = ({
  payload,
  onClear,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!payload) return;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${payload.action || "action"}_${payload.execution_id || "payload"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!payload) {
    return (
      <div className="dock-card">
        <div className="dock-header">
          <div className="dock-title">
            <span>📦 Action & JSON Inspector</span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Awaiting Action</span>
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.6" }}>
          No enterprise action triggered yet. Trigger any action (e.g. <em>Schedule meeting with HR</em> or <em>File IT ticket</em>) to inspect the structured RFC 8259 JSON output in real time.
        </div>
      </div>
    );
  }

  const domain = payload.domain || "enterprise";
  const actionName = payload.action || "mock_action";
  const status = payload.status || "SUCCESS";
  const execId = payload.execution_id || "N/A";

  return (
    <div className="dock-card" style={{ borderColor: "rgba(139, 92, 246, 0.4)" }}>
      <div className="dock-header">
        <div className="dock-title">
          <span>📦 Action & JSON Inspector</span>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#34d399",
            background: "rgba(16, 185, 129, 0.15)",
            padding: "2px 8px",
            borderRadius: "4px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        >
          ● {status} (HTTP 200)
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#f3f4f6" }}>
            Action: <code>{actionName}</code>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            ID: <code style={{ color: "#c084fc" }}>{execId}</code> • Domain: <code style={{ color: "#60a5fa" }}>{domain}</code>
          </div>
        </div>
      </div>

      <pre className="json-viewer">{JSON.stringify(payload, null, 2)}</pre>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button
          onClick={handleCopy}
          style={{
            flex: 1,
            background: copied ? "#059669" : "#1e293b",
            border: "1px solid var(--border-subtle)",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {copied ? "✓ Copied to Clipboard" : "📋 Copy JSON"}
        </button>
        <button
          onClick={handleDownload}
          style={{
            flex: 1,
            background: "#1e3a8a",
            border: "1px solid #3b82f6",
            color: "#93c5fd",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          📥 Export JSON
        </button>
        <button
          onClick={onClear}
          style={{
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "var(--text-muted)",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};
