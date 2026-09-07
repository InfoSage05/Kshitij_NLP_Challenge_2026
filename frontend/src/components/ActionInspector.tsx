"use client";

import React, { useState } from "react";

interface ActionInspectorProps {
  payload: Record<string, any> | null;
  onClear: () => void;
}

const IconBox = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </svg>
);

const IconCopy = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

const IconDownload = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M4 21h16" />
  </svg>
);

const IconJson = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1" />
    <path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1" />
  </svg>
);

function domainPillClass(domain: string): string {
  const d = (domain || "").toLowerCase();
  if (d.includes("it_")) return "pill-it";
  if (d.includes("hr_")) return "pill-hr";
  if (d.includes("developer")) return "pill-dev";
  return "pill-rag";
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
    setTimeout(() => setCopied(false), 1800);
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
          <div>
            <div className="dock-title">
              {IconBox}
              Action inspector
            </div>
            <div className="dock-sub">RFC 8259 JSON contract for the latest action</div>
          </div>
          <span className="pill pill-neutral">awaiting action</span>
        </div>
        <p className="empty-note">
          <strong>No action emitted yet.</strong> Document answers stay in the chat;
          workplace commands (meetings, tickets, access requests) appear here as
          validated JSON with an execution ID.
        </p>
        <div className="empty-examples">
          <span className="empty-example">Schedule a meeting with HR tomorrow at 10am</span>
          <span className="empty-example">File an IT ticket for a faulty monitor</span>
        </div>
      </div>
    );
  }

  const domain = payload.domain || "enterprise";
  const actionName = payload.action || "mock_action";
  const status = payload.status || "SUCCESS";
  const execId = payload.execution_id || "—";
  const fileName = `${actionName}_${execId}.json`;

  return (
    <div className="dock-card accented">
      <div className="dock-header">
        <div>
          <div className="dock-title">
            {IconBox}
            Action inspector
          </div>
          <div className="dock-sub">Validated payload · ready for downstream API</div>
        </div>
        <div className="dock-badges">
          <span className="pill pill-success">
            <span className="dot" />
            {status} · 200
          </span>
        </div>
      </div>

      <div className="action-summary">
        <div className="action-name">{actionName}</div>
        <div className="action-meta">
          <span className={`pill ${domainPillClass(domain)}`}>{domain.replace(/_/g, " ")}</span>
          <span className="kv">id: <strong>{execId}</strong></span>
        </div>
      </div>

      <div className="json-toolbar">
        <span className="json-filename">{IconJson}{fileName}</span>
        <span className="json-valid">schema valid</span>
      </div>
      <pre className="json-viewer">{JSON.stringify(payload, null, 2)}</pre>

      <div className="btn-row">
        <button onClick={handleCopy} className="btn btn-primary">
          {IconCopy}
          {copied ? "Copied" : "Copy JSON"}
        </button>
        <button onClick={handleDownload} className="btn">
          {IconDownload}
          Export
        </button>
        <button onClick={onClear} className="btn btn-ghost">
          Clear
        </button>
      </div>
    </div>
  );
};
