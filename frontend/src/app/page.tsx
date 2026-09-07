"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "../components/Navbar";
import { JudgeBenchmarkBar } from "../components/JudgeBenchmarkBar";
import { WorkflowTracer, WorkflowStep } from "../components/WorkflowTracer";
import { ActionInspector } from "../components/ActionInspector";
import { PageInspectorModal } from "../components/PageInspectorModal";
import { WorkflowGraphTab } from "../components/WorkflowGraphTab";
import { ToolRegistryTab } from "../components/ToolRegistryTab";

interface Citation {
  citation_id: number;
  page: number;
  score: number;
  text: string;
  source: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  actionPayload?: Record<string, any> | null;
  intent?: string;
  latencyMs?: number;
  timestamp?: string;
}

/* Comprehensive normal chat formatter:
   Eliminates all raw markdown symbols ('#', '**', '*', '>', '`')
   and renders clean, professional enterprise chat responses. */
function renderFormatted(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split("\n");

  return lines.map((rawLine, lIdx) => {
    // 1. Strip leading markdown headers like ### or ## or #
    let line = rawLine.replace(/^[ \t]*#{1,6}\s*/, "").trimEnd();

    // 2. Strip blockquotes like >
    line = line.replace(/^[ \t]*>\s*/, "");

    // 3. Strip any stray # symbols anywhere in the line
    line = line.replace(/#/g, "");

    // Preserve blank spacing
    if (!line.trim()) {
      return <div key={lIdx} style={{ height: "6px" }} />;
    }

    // Check if line was a header / section title
    const isHeading =
      rawLine.trim().startsWith("#") ||
      line.startsWith("Grounded Response") ||
      line.startsWith("Autonomous Action Executed:");

    // Check if line is a bullet item (starts with - or •)
    const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("• ");
    const bulletContent = isBullet ? line.trim().replace(/^[-•]\s*/, "") : line;

    // Parse inline bold (**text**) and code (`code`) into clean HTML elements with zero raw symbols
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let key = 0;

    while ((m = regex.exec(bulletContent)) !== null) {
      if (m.index > last) {
        // Strip any stray asterisks or backticks in plain text segment
        parts.push(bulletContent.slice(last, m.index).replace(/[\*`]/g, ""));
      }
      if (m[2]) {
        // Render bold text cleanly without any asterisks
        parts.push(
          <strong key={key++} style={{ fontWeight: 600 }}>
            {m[2].replace(/[\*`]/g, "")}
          </strong>
        );
      } else if (m[3]) {
        // Render inline code cleanly without backticks
        parts.push(
          <code
            key={key++}
            style={{
              fontSize: "12px",
              background: "rgba(127, 141, 166, 0.15)",
              padding: "1px 5px",
              borderRadius: "4px",
              fontFamily: "var(--font-mono)",
            }}
          >
            {m[3]}
          </code>
        );
      } else if (m[4]) {
        // Render italic cleanly without asterisks
        parts.push(<em key={key++}>{m[4].replace(/[\*`]/g, "")}</em>);
      }
      last = m.index + m[0].length;
    }

    if (last < bulletContent.length) {
      parts.push(bulletContent.slice(last).replace(/[\*`]/g, ""));
    }

    if (isHeading) {
      return (
        <div
          key={lIdx}
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text-main)",
            marginTop: lIdx > 0 ? "8px" : "0",
            marginBottom: "4px",
          }}
        >
          {parts}
        </div>
      );
    }

    if (isBullet) {
      return (
        <div
          key={lIdx}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            margin: "3px 0",
            lineHeight: "1.5",
          }}
        >
          <span style={{ color: "var(--primary)", fontWeight: 700, userSelect: "none" }}>•</span>
          <div>{parts}</div>
        </div>
      );
    }

    return (
      <div key={lIdx} style={{ lineHeight: "1.6", margin: "2px 0" }}>
        {parts}
      </div>
    );
  });
}

const IconSend = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

const IconDoc = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 13h6M9 17h6" />
  </svg>
);

const IconBook = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" />
    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
  </svg>
);

const IconZap = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
);

function nowTime(): string {
  try {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<"chat" | "workflow" | "tools">("chat");
  const [statusData, setStatusData] = useState<any>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to AegisEnterprise Copilot — the workplace assistant for HCLTech operations.\n\nI answer questions grounded in the HCLTech Annual Report 2024-25 (423 pages, every claim cited by page), and I execute routine IT, HR, and engineering actions as validated JSON.\n\nUse the Evaluate bar above to run a one-click check, or type a question below to begin.",
      citations: [],
      timestamp: nowTime(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      step_number: 1,
      name: "Intent classification & routing",
      description: "Routes input to the RAG branch or the action branch.",
      status: "COMPLETED",
      details: { state: "ready" },
    },
    {
      step_number: 2,
      name: "Retrieval / parameter extraction",
      description: "Top-k vector retrieval over 2,139 chunks, or structured argument extraction.",
      status: "COMPLETED",
      details: { collection: "hcltech_annual_report_2024_25" },
    },
    {
      step_number: 3,
      name: "Schema validation",
      description: "Pydantic v2 contract check for enterprise actions.",
      status: "COMPLETED",
      details: { compliance: "100% valid" },
    },
    {
      step_number: 4,
      name: "Dispatch & grounding",
      description: "Mock execution payload plus page-anchored citations.",
      status: "COMPLETED",
      details: { source_pages: 423 },
    },
  ]);

  const [lastLatency, setLastLatency] = useState<number>(0);
  const [lastIntent, setLastIntent] = useState<string>("READY");
  const [lastDomain, setLastDomain] = useState<string>("general");
  const [lastActionPayload, setLastActionPayload] = useState<Record<string, any> | null>(null);
  const [inspectingPage, setInspectingPage] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("aegis_theme") as "light" | "dark" | null;
      const initialTheme = savedTheme || "light";
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    } catch {
      /* noop */
    }

    fetch("http://localhost:8000/api/status")
      .then((res) => res.json())
      .then((data) => setStatusData(data))
      .catch((err) => console.error("Could not fetch status:", err));
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("aegis_theme", next);
    } catch {
      /* noop */
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: queryText.trim(),
      timestamp: nowTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText.trim() }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply_text,
        citations: data.citations || [],
        actionPayload: data.action_payload,
        intent: data.intent,
        latencyMs: data.execution_time_ms,
        timestamp: nowTime(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setWorkflowSteps(data.workflow_trace || []);
      setLastLatency(data.execution_time_ms);
      setLastIntent(data.intent);
      setLastDomain(data.domain);

      if (data.action_payload) {
        setLastActionPayload(data.action_payload);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Connection error — the backend is unreachable (${err.message}). Start the API with "python -m uvicorn api:app --port 8000" and retry.`,
        timestamp: nowTime(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerBenchmark = (prompt: string) => {
    if (activeTab !== "chat") {
      setActiveTab("chat");
    }
    handleSend(prompt);
  };

  return (
    <div className="app-container" data-theme={theme}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        statusData={statusData}
      />

      <JudgeBenchmarkBar onSelectPrompt={handleTriggerBenchmark} isLoading={isLoading} />

      {activeTab === "workflow" ? (
        <WorkflowGraphTab />
      ) : activeTab === "tools" ? (
        <ToolRegistryTab onTriggerTool={handleTriggerBenchmark} />
      ) : (
        <div className="main-content">
          <div className="chat-pane">
            <div className="chat-pane-header">
              <div>
                <div className="chat-pane-title">Copilot Console</div>
                <div className="chat-pane-sub">Grounded answers · Validated actions · Full audit trail</div>
              </div>
              <div className="header-badges">
                <span className="mini-badge">{lastIntent}</span>
                <span className="mini-badge">{lastDomain.replace(/_/g, " ")}</span>
                <span className="mini-badge accent">
                  {lastLatency > 0 ? `${Math.round(lastLatency)} ms` : "idle"}
                </span>
              </div>
            </div>

            <div className="chat-history">
              {messages.map((m) =>
                m.id === "welcome" ? (
                  <div key={m.id} className="message-row assistant" style={{ maxWidth: "100%" }}>
                    <div className="avatar bot">AE</div>
                    <div className="welcome-card" style={{ flex: 1 }}>
                      <span className="welcome-kicker">HCLTech Annual Report 2024–25 · 423 pages</span>
                      <div className="welcome-title">What can this copilot do?</div>
                      <p className="welcome-text">
                        Ask anything about the integrated annual report — every answer carries a
                        verifiable page citation. Or issue a workplace command and inspect the
                        validated JSON it produces.
                      </p>
                      <ul className="welcome-list">
                        <li>
                          <span>{IconBook}</span>
                          <span>“What are the key risks on page 45?” — opens the exact source page for audit.</span>
                        </li>
                        <li>
                          <span>{IconZap}</span>
                          <span>“File a critical VPN ticket for Noida SEZ” — generates an RFC 8259 action payload.</span>
                        </li>
                      </ul>
                      <div className="message-meta">
                        <span>System ready</span>
                        {m.timestamp && (
                          <>
                            <span>·</span>
                            <span suppressHydrationWarning>{m.timestamp}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className={`message-row ${m.role === "user" ? "user" : "assistant"}`}>
                    <div className={`avatar ${m.role === "assistant" ? "bot" : "user"}`}>
                      {m.role === "assistant" ? "AE" : "You"}
                    </div>
                    <div className="message-card">
                      <div className="message-body">{renderFormatted(m.content)}</div>

                      {m.citations && m.citations.length > 0 && (
                        <div className="citation-row">
                          <span className="citation-label">Sources — select to inspect page</span>
                          {m.citations.map((c) => (
                            <button
                              key={c.citation_id}
                              className="citation-chip"
                              onClick={() => setInspectingPage(c.page)}
                              title="Open verbatim page text"
                            >
                              {IconDoc}
                              p.{c.page} · {(c.score * 100).toFixed(0)}%
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="message-meta">
                        {m.intent && <span>{m.intent}</span>}
                        {typeof m.latencyMs === "number" && m.latencyMs > 0 && (
                          <>
                            <span>·</span>
                            <span>{Math.round(m.latencyMs)} ms</span>
                          </>
                        )}
                        {m.timestamp && (
                          <>
                            <span>·</span>
                            <span suppressHydrationWarning>{m.timestamp}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
              {isLoading && (
                <div className="message-row assistant">
                  <div className="avatar bot">AE</div>
                  <div className="typing-card">
                    <span className="spinner" />
                    <span>Classifying intent, checking schema, querying ChromaDB…</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-container">
              <form
                className="chat-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputQuery);
                }}
              >
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask about the annual report, or type an action — e.g. “Schedule a meeting with HR tomorrow at 10am”…"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  disabled={isLoading}
                  aria-label="Message the copilot"
                />
                <button type="submit" className="chat-send-btn" disabled={isLoading || !inputQuery.trim()}>
                  {IconSend}
                  Send
                </button>
              </form>
              <div className="chat-hint">
                Citations open the verbatim PDF page · Actions emit <code>execution_id</code> JSON for audit
              </div>
            </div>
          </div>

          <div className="inspector-pane">
            <WorkflowTracer
              steps={workflowSteps}
              latencyMs={lastLatency}
              intent={lastIntent}
              domain={lastDomain}
            />
            <ActionInspector
              payload={lastActionPayload}
              onClear={() => setLastActionPayload(null)}
            />
          </div>
        </div>
      )}

      <PageInspectorModal
        pageNumber={inspectingPage}
        onClose={() => setInspectingPage(null)}
      />
    </div>
  );
}
