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

export const WorkflowTracer: React.FC<WorkflowTracerProps> = ({
  steps,
  latencyMs,
  intent,
  domain,
}) => {
  return (
    <div className="dock-card">
      <div className="dock-header">
        <div className="dock-title">
          <span>⚡ Live Agentic State Machine Trace</span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <span
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              background: "rgba(59, 130, 246, 0.15)",
              color: "#93c5fd",
              padding: "2px 8px",
              borderRadius: "4px",
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            {latencyMs > 0 ? `${latencyMs} ms` : "IDLE"}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              background: intent === "ACTION" ? "rgba(139, 92, 246, 0.2)" : "rgba(16, 185, 129, 0.2)",
              color: intent === "ACTION" ? "#c084fc" : "#34d399",
              padding: "2px 8px",
              borderRadius: "4px",
              border: intent === "ACTION" ? "1px solid rgba(139, 92, 246, 0.4)" : "1px solid rgba(16, 185, 129, 0.4)",
            }}
          >
            {intent}
          </span>
        </div>
      </div>

      {steps && steps.length > 0 ? (
        <div style={{ marginTop: "12px" }}>
          {steps.map((s) => (
            <div key={s.step_number} className="workflow-step">
              <div className="step-num">{s.step_number}</div>
              <div className="step-content">
                <div className="step-name">{s.name}</div>
                <div className="step-desc">{s.description}</div>
                {s.details && Object.keys(s.details).length > 0 && (
                  <div style={{ marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {Object.entries(s.details).map(([k, v]) => (
                      <span key={k} className="step-tag">
                        {k}: <strong>{typeof v === "object" ? JSON.stringify(v) : String(v)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: "var(--text-muted)", fontSize: "13px", padding: "14px 0" }}>
          Execute any query or click a benchmark test above to observe the live step-by-step agentic execution trace.
        </div>
      )}
    </div>
  );
};
