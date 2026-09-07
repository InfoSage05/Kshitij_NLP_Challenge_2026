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
  const ragTests = [
    {
      id: "q1",
      kicker: "RAG",
      kickerClass: "rag",
      label: "Risk factors · p.45",
      prompt: "What are the key risks mentioned on page 45 of the Annual Report?",
    },
    {
      id: "q2",
      kicker: "RAG",
      kickerClass: "rag",
      label: "FY25 revenue & growth",
      prompt: "What is the revenue growth and financial performance reported?",
    },
  ];

  const actionTests = [
    {
      id: "a1",
      kicker: "HR",
      kickerClass: "hr",
      label: "Schedule HR meeting",
      prompt: "Schedule a meeting with HR tomorrow at 10 AM regarding my leave query",
    },
    {
      id: "a2",
      kicker: "IT",
      kickerClass: "it",
      label: "File critical VPN ticket",
      prompt: "File a critical ticket: GlobalProtect VPN gateway failure in Noida SEZ",
    },
    {
      id: "a3",
      kicker: "IT",
      kickerClass: "it",
      label: "Provision Docker Desktop",
      prompt: "Request software access for Docker Desktop for backend development",
    },
    {
      id: "a4",
      kicker: "DEV",
      kickerClass: "dev",
      label: "Create GitHub issue",
      prompt: "Create a GitHub issue: Auth service token expiration causes 500 error",
    },
  ];

  return (
    <div className="benchmark-bar" aria-label="Evaluation shortcuts">
      <span className="benchmark-eyebrow">Evaluate</span>
      <span className="benchmark-group-label">Docs</span>
      {ragTests.map((b) => (
        <button
          key={b.id}
          className="benchmark-chip"
          disabled={isLoading}
          onClick={() => onSelectPrompt(b.prompt)}
          title={b.prompt}
        >
          <span className={`chip-kicker ${b.kickerClass}`}>{b.kicker}</span>
          <span>{b.label}</span>
        </button>
      ))}
      <span className="benchmark-sep" />
      <span className="benchmark-group-label">Actions</span>
      {actionTests.map((b) => (
        <button
          key={b.id}
          className="benchmark-chip"
          disabled={isLoading}
          onClick={() => onSelectPrompt(b.prompt)}
          title={b.prompt}
        >
          <span className={`chip-kicker ${b.kickerClass}`}>{b.kicker}</span>
          <span>{b.label}</span>
        </button>
      ))}
    </div>
  );
};
