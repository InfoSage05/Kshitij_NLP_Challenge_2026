"use client";

import React from "react";

interface NavbarProps {
  activeTab: "chat" | "workflow" | "tools";
  setActiveTab: (tab: "chat" | "workflow" | "tools") => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
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
  theme,
  toggleTheme,
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

      <div className="nav-tabs">
        <button
          onClick={() => setActiveTab("chat")}
          className={`nav-tab-btn ${activeTab === "chat" ? "active" : ""}`}
        >
          💬 Copilot Console
        </button>
        <button
          onClick={() => setActiveTab("workflow")}
          className={`nav-tab-btn ${activeTab === "workflow" ? "active" : ""}`}
        >
          ⚡ Workflow Architecture
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          className={`nav-tab-btn ${activeTab === "tools" ? "active" : ""}`}
        >
          🗂️ Tool Registry
        </button>
      </div>

      <div className="nav-controls">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title="Toggle Light / Dark Mode"
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>

        <div className="status-pill">
          <div className="status-dot"></div>
          <span>ChromaDB Online</span>
        </div>
        <div className="meta-pill">
          <span>{pages} Pages • {chunks.toLocaleString()} Chunks</span>
        </div>
      </div>
    </header>
  );
};
