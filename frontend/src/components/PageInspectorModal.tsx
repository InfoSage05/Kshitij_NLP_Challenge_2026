"use client";

import React, { useEffect, useState } from "react";

interface PageInspectorModalProps {
  pageNumber: number | null;
  onClose: () => void;
}

export const PageInspectorModal: React.FC<PageInspectorModalProps> = ({
  pageNumber,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pageNumber === null) return;
    setLoading(true);
    setError(null);

    fetch(`http://localhost:8000/api/page/${pageNumber}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load page ${pageNumber}`);
        return res.json();
      })
      .then((data) => {
        setContent(data.text || "(Empty page content)");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [pageNumber]);

  if (pageNumber === null) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#f3f4f6" }}>
              📄 Verifiable Page Inspector: Page {pageNumber} of 423
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Source: <em>HCLTech Annual Integrated Report 2024-25</em>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "none",
              color: "#fff",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              Extracting raw text from physical page {pageNumber}...
            </div>
          ) : error ? (
            <div style={{ color: "#f87171", padding: "20px" }}>Error: {error}</div>
          ) : (
            <div style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)", fontSize: "13px" }}>
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
