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
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "workflow" | "tools">("chat");
  const [statusData, setStatusData] = useState<any>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 **Welcome to AegisEnterprise Copilot!**\n\n" +
        "I am your autonomous enterprise copilot for **HCLTech** operations. I can:\n" +
        "1. **Answer document queries** with exact page citations from the *HCLTech Annual Report 2024-25* (423 pages).\n" +
        "2. **Execute enterprise actions** (Schedule HR syncs, file IT tickets, provision software, log GitHub issues).\n\n" +
        "Select any test from the **Judge Benchmark Suite** above or enter your query below!",
      citations: [],
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Workflow Tracer state
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      step_number: 1,
      name: "Autonomous Intent Routing",
      description: "Classifies natural language input into enterprise action or document RAG query.",
      status: "COMPLETED",
      details: { ready: true },
    },
    {
      step_number: 2,
      name: "Parameter Extraction & Vector Retrieval",
      description: "Extracts action parameters or retrieves top-k chunks from 2,139 ChromaDB vectors.",
      status: "COMPLETED",
      details: { collection: "hcltech_annual_report_2024_25" },
    },
    {
      step_number: 3,
      name: "Pydantic Schema Validation",
      description: "Enforces strict RFC 8259 enterprise data contracts across IT, HR, and Dev domains.",
      status: "COMPLETED",
      details: { compliance: "100% Valid" },
    },
    {
      step_number: 4,
      name: "JSON Mock Dispatch & Citation Grounding",
      description: "Generates mock execution ID and physical page citations from the 423-page report.",
      status: "COMPLETED",
      details: { source_pages: 423 },
    },
  ]);
  const [lastLatency, setLastLatency] = useState<number>(0);
  const [lastIntent, setLastIntent] = useState<string>("SYSTEM_READY");
  const [lastDomain, setLastDomain] = useState<string>("general");
  const [lastActionPayload, setLastActionPayload] = useState<Record<string, any> | null>(null);
  const [inspectingPage, setInspectingPage] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load status on mount
  useEffect(() => {
    fetch("http://localhost:8000/api/status")
      .then((res) => res.json())
      .then((data) => setStatusData(data))
      .catch((err) => console.error("Could not fetch status:", err));
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: queryText.trim(),
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
        content: `⚠️ **Connection Error**: Unable to reach AegisEnterprise backend (${err.message}). Ensure \`api.py\` is running on port 8000.`,
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
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} statusData={statusData} />

      {/* 1-Click Judge Benchmark Suite */}
      <JudgeBenchmarkBar onSelectPrompt={handleTriggerBenchmark} isLoading={isLoading} />

      {/* Main Body depending on Tab */}
      {activeTab === "workflow" ? (
        <WorkflowGraphTab />
      ) : activeTab === "tools" ? (
        <ToolRegistryTab onTriggerTool={handleTriggerBenchmark} />
      ) : (
        <div className="main-content">
          {/* Left Column: Conversational Workspace */}
          <div className="chat-pane">
            <div className="chat-history">
              {messages.map((m) => (
                <div key={m.id} className={`message-bubble ${m.role}`}>
                  <div className={`avatar ${m.role}`}>
                    {m.role === "assistant" ? "🤖" : "👤"}
                  </div>
                  <div>
                    <div className="message-content">
                      <div style={{ whiteSpace: "pre-line" }}>{m.content}</div>

                      {/* Page Citations */}
                      {m.citations && m.citations.length > 0 && (
                        <div className="citation-container">
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                            Physical Page Citations:
                          </span>
                          {m.citations.map((c) => (
                            <button
                              key={c.citation_id}
                              className="citation-chip"
                              onClick={() => setInspectingPage(c.page)}
                              title={`Click to view physical page ${c.page} in HCLTech report`}
                            >
                              📍 Page {c.page} ({(c.score * 100).toFixed(0)}%)
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message-bubble bot">
                  <div className="avatar bot">🤖</div>
                  <div className="message-content" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="status-dot"></div>
                    <span>Evaluating intent, verifying schemas & querying ChromaDB...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
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
                  placeholder="Ask a question about HCLTech report or trigger an action (e.g. 'Schedule meeting with HR')..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  disabled={isLoading}
                />
                <button type="submit" className="chat-send-btn" disabled={isLoading || !inputQuery.trim()}>
                  Send ➔
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Workflow State Stepper & Action Inspector */}
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

      {/* Verifiable Page Inspector Modal */}
      <PageInspectorModal
        pageNumber={inspectingPage}
        onClose={() => setInspectingPage(null)}
      />
    </div>
  );
}
