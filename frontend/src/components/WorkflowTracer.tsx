"use client";

import React from "react";

export interface WorkflowStep {
  step_number: number;
  name: string;
  description: string;
  status: string;
  details: Record<string, any>;
}

interface WorkflowTracerProps {
  steps: WorkflowStep[];
  latencyMs: number;
  intent: string;
  domain: string;
}

const IconTrace = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h6M4 12h10M4 18h7" />
    <circle cx="19" cy="6" r="2" />
    <circle cx="19" cy="18" r="2" />
    <path d="M19 8v8" />
  </svg>
);

function formatValue(v: any): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") {
    const s = JSON.stringify(v);
    return s.length > 48 ? s.slice(0, 48) + "…" : s;
  }
  const s = String(v);
  return s.length > 48 ? s.slice(0, 48) + "…" : s;
}

export const WorkflowTracer: React.FC<WorkflowTracerProps> = ({
  steps,
  latencyMs,
  intent,
  domain,
}) => {
  const isAction = intent === "ACTION";

  return (
    <div className="dock-card">
      <div className="dock-header">
        <div>
          <div className="dock-title">
            {IconTrace}
            Execution trace
          </div>
          <div className="dock-sub">Four-stage agent pipeline, updated per response</div>
        </div>
        <div className="dock-badges">
          <span className="pill pill-neutral">{latencyMs > 0 ? `${Math.round(latencyMs)} ms` : "idle"}</span>
          <span className={`pill ${isAction ? "pill-hr" : "pill-it"}`}>{intent}</span>
        </div>
      </div>

      {steps && steps.length > 0 ? (
        <div>
          {steps.map((s) => (
            <div key={s.step_number} className="workflow-step done">
              <div className="step-num">{s.step_number}</div>
              <div className="step-content">
                <div className="step-name">{s.name}</div>
                <div className="step-desc">{s.description}</div>
                {s.details && Object.keys(s.details).length > 0 && (
                  <div className="step-tags">
                    {Object.entries(s.details).slice(0, 3).map(([k, v]) => (
                      <span key={k} className="step-tag">
                        {k}: <strong>{formatValue(v)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="step-tags" style={{ marginTop: "4px" }}>
            <span className="step-tag">domain: <strong>{domain.replace(/_/g, " ")}</strong></span>
          </div>
        </div>
      ) : (
        <div className="empty-note">
          Run any query to watch routing, retrieval, validation, and dispatch unfold here.
        </div>
      )}
    </div>
  );
};
