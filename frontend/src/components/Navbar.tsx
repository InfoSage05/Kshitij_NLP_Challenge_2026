"use client";

import React from "react";

interface NavbarProps {
  activeTab: "chat" | "workflow" | "tools";
  setActiveTab: (tab: "chat" | "workflow" | "tools") => void;
  statusData: {
    status?: string;
    knowledge_base?: {
      total_pages?: number;
      total_indexed_chunks?: number;
      embedding_model?: string;
    };
  } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  statusData,
}) => {
  const pages = statusData?.knowledge_base?.total_pages || 423;
  const chunks = statusData?.knowledge_base?.total_indexed_chunks || 2139;

  return (
    <header className="navbar">
      <div className="brand-section">
        <div className="logo-badge">AEGIS</div>
        <div>
          <div className="brand-title">AegisEnterprise Copilot</div>
          <div className="brand-subtitle">
            Autonomous Multi-Domain Agentic Assistant | Kshitij 2026 (IIT Kharagpur & HCLTech)
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => setActiveTab("chat")}
          style={{
            background: activeTab === "chat" ? "rgba(59, 130, 246, 0.25)" : "transparent",
            color: activeTab === "chat" ? "#60a5fa" : "#94a3b8",
            border: activeTab === "chat" ? "1px solid #3b82f6" : "1px solid transparent",
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          💬 Copilot Console
        </button>
        <button
          onClick={() => setActiveTab("workflow")}
          style={{
            background: activeTab === "workflow" ? "rgba(139, 92, 246, 0.25)" : "transparent",
            color: activeTab === "workflow" ? "#c084fc" : "#94a3b8",
            border: activeTab === "workflow" ? "1px solid #8b5cf6" : "1px solid transparent",
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          ⚡ Workflow Architecture
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          style={{
            background: activeTab === "tools" ? "rgba(16, 185, 129, 0.25)" : "transparent",
            color: activeTab === "tools" ? "#34d399" : "#94a3b8",
            border: activeTab === "tools" ? "1px solid #10b981" : "1px solid transparent",
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          🗂️ Tool Registry
        </button>
      </div>

      <div className="nav-badges">
        <div className="status-pill">
          <div className="status-dot"></div>
          <span>ChromaDB Online</span>
        </div>
        <div className="meta-pill">
          <span>{pages} Pages • {chunks.toLocaleString()} Chunks</span>
        </div>
        <div className="meta-pill" style={{ color: "#60a5fa" }}>
          <span>API :8000</span>
        </div>
      </div>
    </header>
  );
};
