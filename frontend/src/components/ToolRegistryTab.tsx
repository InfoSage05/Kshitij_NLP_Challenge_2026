"use client";

import React, { useEffect, useState } from "react";

interface ToolItem {
  name: string;
  domain: string;
  json_schema: Record<string, any>;
  description: string;
}

interface ToolRegistryTabProps {
  onTriggerTool: (samplePrompt: string) => void;
}

function domainClass(domain: string): string {
  const d = (domain || "").toLowerCase();
  if (d.includes("it_")) return "pill-it";
  if (d.includes("hr_")) return "pill-hr";
  if (d.includes("developer")) return "pill-dev";
  return "pill-rag";
}

export const ToolRegistryTab: React.FC<ToolRegistryTabProps> = ({ onTriggerTool }) => {
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/tools")
      .then((res) => res.json())
      .then((data) => {
        setTools(data.tools || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setFailed(true);
      });
  }, []);

  const samplePrompts: Record<string, string> = {
    file_it_ticket: "File a critical ticket: GlobalProtect VPN gateway failure in Noida SEZ",
    request_software: "Request software access for Docker Desktop for backend development",
    check_system_status: "Check system status for GlobalProtect VPN gateway in APAC region",
    schedule_meeting: "Schedule a meeting with HR tomorrow at 10 AM regarding my leave query",
    apply_leave: "Apply for sick leave from 2026-09-10 to 2026-09-12 due to viral fever",
    query_benefits_policy: "What is the health insurance coverage and benefits policy for employees?",
    create_github_issue: "Create a GitHub issue: Auth service token expiration causes 500 error",
    search_code_docs: "Search code docs in hcl-core for JWT token validation handlers",
    suggest_code_fix: "Suggest a code fix for NullPointerException in auth service",
  };

  if (loading) {
    return (
      <div className="tab-page">
        <div className="tab-loading">
          <span className="spinner" />
          Loading tool registry from the API gateway…
        </div>
      </div>
    );
  }

  if (failed || tools.length === 0) {
    return (
      <div className="tab-page">
        <div className="tab-inner">
          <div className="panel-card">
            <div className="branch-title">Registry unavailable</div>
            <p className="branch-text">
              Could not reach <code>/api/tools</code>. Start the backend
              (<code>python -m uvicorn api:app --port 8000</code>) and reopen this tab.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-page">
      <div className="tab-inner">
        <div className="section-head">
          <div className="section-eyebrow">Tool registry · {tools.length} tools</div>
          <h2 className="section-title">Enterprise actions & schemas</h2>
          <p className="section-desc">
            Each tool is a Pydantic v2 contract. Triggering one sends a natural-language
            command through the console and returns the validated JSON in the inspector.
          </p>
        </div>

        <div className="tools-grid">
          {tools.map((t) => {
            const prompt = samplePrompts[t.name] || `Execute action ${t.name}`;
            const required = t.json_schema?.required?.length ?? 0;
            return (
              <div key={t.name} className="tool-card">
                <div className="tool-top">
                  <span className={`pill ${domainClass(t.domain)}`}>
                    {t.domain.replace(/_/g, " ")}
                  </span>
                  <span className="tool-live">
                    <span className="dot" />
                    Active
                  </span>
                </div>
                <div className="tool-name">{t.name}</div>
                <p className="tool-desc">{t.description || "Validated enterprise action."}</p>
                <div className="step-tags" style={{ marginTop: 0 }}>
                  <span className="step-tag">{required} required fields</span>
                  <span className="step-tag">RFC 8259</span>
                </div>
                <button className="tool-btn" onClick={() => onTriggerTool(prompt)}>
                  Run sample request
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
