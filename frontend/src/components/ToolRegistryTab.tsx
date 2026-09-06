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

export const ToolRegistryTab: React.FC<ToolRegistryTabProps> = ({ onTriggerTool }) => {
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/tools")
      .then((res) => res.json())
      .then((data) => {
        setTools(data.tools || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
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
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading enterprise tool registry from FastAPI...
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", overflowY: "auto", height: "100%" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#f3f4f6" }}>
            🗂️ Enterprise Action & Pydantic Schema Registry
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            All registered tools conform to strict Pydantic v2 schemas and output RFC 8259 JSON contracts.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {tools.map((t) => {
            const prompt = samplePrompts[t.name] || `Execute action ${t.name}`;
            return (
              <div
                key={t.name}
                style={{
                  background: "rgba(17, 24, 39, 0.75)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "var(--font-mono)",
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: "rgba(59, 130, 246, 0.15)",
                        color: "#60a5fa",
                      }}
                    >
                      {t.domain.replace("_", " ")}
                    </span>
                    <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>● Active</span>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#f3f4f6", marginBottom: "6px" }}>
                    <code>{t.name}</code>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "12px" }}>
                    {t.description}
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => onTriggerTool(prompt)}
                    style={{
                      width: "100%",
                      background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    ⚡ Test Trigger Action
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
