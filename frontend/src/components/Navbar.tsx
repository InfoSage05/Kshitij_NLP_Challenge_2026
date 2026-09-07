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

const IconShield = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l7 3v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V5l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const IconChat = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />
  </svg>
);

const IconFlow = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <path d="M6.5 10v3.5h7" />
    <path d="M17.5 14v-3.5h-7" />
  </svg>
);

const IconGrid = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const IconSun = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const IconMoon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  statusData,
}) => {
  const pages = statusData?.knowledge_base?.total_pages || 423;
  const chunks = statusData?.knowledge_base?.total_indexed_chunks || 2139;
  const online = (statusData?.status || "ONLINE") === "ONLINE";

  return (
    <header className="navbar">
      <div className="brand-section">
        <div className="brand-mark" aria-hidden="true">{IconShield}</div>
        <div className="brand-wordmark">
          <div className="brand-title">
            AegisEnterprise <span>Copilot</span>
          </div>
          <div className="brand-subtitle">
            HCLTech Workplace Assistant &middot; Kshitij 2026
          </div>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Primary">
        <button
          onClick={() => setActiveTab("chat")}
          className={`nav-tab-btn ${activeTab === "chat" ? "active" : ""}`}
        >
          {IconChat}
          Console
        </button>
        <button
          onClick={() => setActiveTab("workflow")}
          className={`nav-tab-btn ${activeTab === "workflow" ? "active" : ""}`}
        >
          {IconFlow}
          Architecture
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          className={`nav-tab-btn ${activeTab === "tools" ? "active" : ""}`}
        >
          {IconGrid}
          Tool Registry
        </button>
      </nav>

      <div className="nav-controls">
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title="Toggle light / dark mode"
        >
          {theme === "light" ? IconMoon : IconSun}
          {theme === "light" ? "Dark" : "Light"}
        </button>

        <div className="status-pill" title="Vector store connection status">
          <span className={`status-dot ${online ? "pulse" : ""}`} />
          <span>{online ? "ChromaDB Online" : "Connecting"}</span>
        </div>
        <div className="meta-pill" title="Indexed corpus size">
          {pages} pages &middot; {chunks.toLocaleString()} chunks
        </div>
      </div>
    </header>
  );
};
