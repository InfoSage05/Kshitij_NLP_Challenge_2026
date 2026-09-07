"use client";

import React from "react";

const RAG_STEPS = [
  { title: "PyMuPDF extraction", text: "Page-faithful text capture across pages 1–423, preserving physical numbering." },
  { title: "Dense embeddings", text: "all-MiniLM-L6-v2 vectors (384-d) for semantic match." },
  { title: "ChromaDB retrieval", text: "2,139 page-anchored chunks ranked by cosine similarity." },
  { title: "Grounded synthesis", text: "Answers carry page badges; every claim is auditable in the page inspector." },
];

const ACTION_STEPS = [
  { title: "Intent classification", text: "Detects meeting, ticket, software, and issue triggers across 3 domains." },
  { title: "Argument extraction", text: "Normalises dates, priorities, asset names, and severities." },
  { title: "Pydantic v2 validation", text: "Strict type, enum, and required-field checks before anything is emitted." },
  { title: "Mock dispatch", text: "Deterministic execution ID, HTTP-200 envelope, and audit timestamp." },
];

const RUBRIC = [
  { cls: "r1", pct: "30%", name: "Accuracy", desc: "Zero-hallucination retrieval with page-level evidence." },
  { cls: "r2", pct: "30%", name: "Agent capability", desc: "Valid RFC 8259 JSON for 9 registered tools." },
  { cls: "r3", pct: "25%", name: "Practicality", desc: "Covers IT, HR, and engineering desk workflows." },
  { cls: "r4", pct: "15%", name: "Presentation", desc: "Auditable console with trace and source viewer." },
];

export const WorkflowGraphTab: React.FC = () => {
  return (
    <div className="tab-page">
      <div className="tab-inner">
        <div className="section-head">
          <div className="section-eyebrow">System architecture</div>
          <h2 className="section-title">Two branches, one audit trail</h2>
          <p className="section-desc">
            Every request travels the same four-stage pipeline. Document questions resolve
            through retrieval; workplace commands resolve through validated function calls.
            Both paths emit timing, intent, and evidence to the console.
          </p>
        </div>

        <div className="branch-grid">
          <div className="branch-card">
            <span className="branch-kicker blue">Branch 01 · Retrieval</span>
            <div className="branch-title">Page-accurate RAG engine</div>
            <p className="branch-text">
              Built on the mandated HCLTech Annual Integrated Report 2024–25. Nothing is
              generated without a cited source page.
            </p>
            <div className="branch-steps">
              {RAG_STEPS.map((s, i) => (
                <div key={s.title} className="branch-step">
                  <span className="branch-step-num">{i + 1}</span>
                  <span><strong>{s.title}.</strong> {s.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="branch-card">
            <span className="branch-kicker red">Branch 02 · Actions</span>
            <div className="branch-title">Validated function calling</div>
            <p className="branch-text">
              HR, IT, and developer operations exposed as typed tools. Invalid arguments
              never dispatch — they fail validation first.
            </p>
            <div className="branch-steps">
              {ACTION_STEPS.map((s, i) => (
                <div key={s.title} className="branch-step">
                  <span className="branch-step-num">{i + 1}</span>
                  <span><strong>{s.title}.</strong> {s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel-card">
          <div className="branch-title" style={{ fontSize: "14px" }}>Rubric coverage</div>
          <p className="branch-text" style={{ marginBottom: 0 }}>
            How the build maps to the Kshitij 2026 scoring weights.
          </p>
          <div className="rubric-grid">
            {RUBRIC.map((r) => (
              <div key={r.name} className={`rubric-card ${r.cls}`}>
                <div className="rubric-pct">{r.pct}</div>
                <div className="rubric-name">{r.name}</div>
                <div className="rubric-desc">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
