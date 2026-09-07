"use client";

import React, { useEffect, useState } from "react";

interface PageInspectorModalProps {
  pageNumber: number | null;
  onClose: () => void;
}

const IconDoc = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

export const PageInspectorModal: React.FC<PageInspectorModalProps> = ({
  pageNumber,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>("");
  const [charCount, setCharCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pageNumber === null) return;
    setLoading(true);
    setError(null);
    setContent("");

    fetch(`http://localhost:8000/api/page/${pageNumber}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: could not load page ${pageNumber}`);
        return res.json();
      })
      .then((data) => {
        setContent(data.text || "(This page contains no extractable text — it may be a scanned figure or table.)");
        setCharCount(data.char_count || 0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [pageNumber]);

  useEffect(() => {
    if (pageNumber === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pageNumber, onClose]);

  if (pageNumber === null) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Source page ${pageNumber}`}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {IconDoc}
              Source verification — Page {pageNumber} of 423
            </div>
            <div className="modal-source">
              HCLTech Annual Integrated Report 2024–25 · verbatim extraction via PyMuPDF
            </div>
          </div>
          <button onClick={onClose} className="modal-close" aria-label="Close inspector">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="skeleton" aria-label="Loading page text">
              <div className="skeleton-bar" style={{ width: "42%" }} />
              <div className="skeleton-bar" style={{ width: "100%" }} />
              <div className="skeleton-bar" style={{ width: "96%" }} />
              <div className="skeleton-bar" style={{ width: "88%" }} />
              <div className="skeleton-bar" style={{ width: "64%" }} />
            </div>
          ) : error ? (
            <div className="modal-error">Could not load this page. {error}</div>
          ) : (
            content
          )}
        </div>

        <div className="modal-footer">
          <span>Esc to close · click outside to dismiss</span>
          {!loading && !error && <span>{charCount.toLocaleString()} chars</span>}
        </div>
      </div>
    </div>
  );
};
