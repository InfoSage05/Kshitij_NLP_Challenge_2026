"use client";

import React from "react";

interface BenchmarkBarProps {
  onSelectPrompt: (prompt: string) => void;
  isLoading: boolean;
}

export const JudgeBenchmarkBar: React.FC<BenchmarkBarProps> = ({
  onSelectPrompt,
  isLoading,
}) => {
  const benchmarks = [
    {
      id: "q1",
      label: "📄 Test 1: Page 45 Risk Factors",
      prompt: "What are the key risks mentioned on page 45 of the Annual Report?",
      type: "rag",
    },
    {
      id: "q2",
      label: "📈 Test 2: FY25 Revenue Growth",
      prompt: "What is the revenue growth and financial performance reported?",
      type: "rag",
    },
    {
      id: "a1",
      label: "🤝 Action 1: Schedule HR Meeting",
      prompt: "Schedule a meeting with HR tomorrow at 10 AM regarding my leave query",
      type: "action",
    },
    {
      id: "a2",
      label: "🎫 Action 2: File Critical VPN Ticket",
      prompt: "File a critical ticket: GlobalProtect VPN gateway failure in Noida SEZ",
      type: "action",
    },
    {
      id: "a3",
      label: "💻 Action 3: Provision Docker Desktop",
      prompt: "Request software access for Docker Desktop for backend development",
      type: "action",
    },
    {
      id: "a4",
      label: "🐛 Action 4: Create GitHub Issue",
      prompt: "Create a GitHub issue: Auth service token expiration causes 500 error",
      type: "action",
    },
  ];

  return (
    <div className="benchmark-bar">
      <div className="benchmark-label">
        <span>🎯 Judge Benchmark Suite:</span>
      </div>
      {benchmarks.map((b) => (
        <button
          key={b.id}
          className="benchmark-chip"
          disabled={isLoading}
          onClick={() => onSelectPrompt(b.prompt)}
          style={{
            borderColor:
              b.type === "action"
                ? "rgba(139, 92, 246, 0.4)"
                : "rgba(59, 130, 246, 0.4)",
          }}
        >
          <span>{b.label}</span>
        </button>
      ))}
    </div>
  );
};
