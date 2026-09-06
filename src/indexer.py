"""PDF Ingestion and Page-Accurate Chunking Pipeline."""

import os
import re
from typing import List, Dict, Any, Tuple
import fitz  # PyMuPDF

from src.config import (
    PDF_PATH,
    PDF_FILENAME,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
)
from src.vector_store import VectorStoreManager


def extract_pages_from_pdf(pdf_path: str) -> List[Tuple[int, str]]:
    """Extracts raw text page by page from PDF. Returns list of (page_number_1_indexed, text)."""
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found at: {pdf_path}")

    doc = fitz.open(pdf_path)
    extracted = []
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        text = page.get_text("text")
        # Clean excessive whitespace while preserving structure
        cleaned_text = re.sub(r"[ \t]+", " ", text).strip()
        if cleaned_text:
            extracted.append((page_idx + 1, cleaned_text))

    print(f"Extracted text from {len(extracted)} non-empty pages out of {len(doc)} total pages.")
    return extracted


def chunk_page_text(
    page_num: int,
    text: str,
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
) -> List[Dict[str, Any]]:
    """Splits a single page's text into overlapping chunks, anchored to its exact page number."""
    if len(text) <= chunk_size:
        return [{
            "chunk_id": f"p{page_num}_c0",
            "page": page_num,
            "text": text,
            "char_count": len(text),
        }]

    chunks = []
    start = 0
    chunk_idx = 0
    step = chunk_size - chunk_overlap

    while start < len(text):
        end = min(start + chunk_size, len(text))
        
        # If not at the very end, try to break on sentence or newline boundaries
        if end < len(text):
            boundary = max(
                text.rfind("\n", start, end),
                text.rfind(". ", start, end),
            )
            if boundary > start + (chunk_size // 2):
                end = boundary + 1

        subtext = text[start:end].strip()
        if len(subtext) > 40:  # Ignore tiny noise chunks
            chunks.append({
                "chunk_id": f"p{page_num}_c{chunk_idx}",
                "page": page_num,
                "text": subtext,
                "char_count": len(subtext),
            })
            chunk_idx += 1

        start += step
        if start >= len(text):
            break

    return chunks


def build_index(pdf_path: str = str(PDF_PATH), force_reindex: bool = False):
    """Full indexing pipeline: extracts pages, chunks text, and embeds into ChromaDB."""
    vsm = VectorStoreManager()
    existing_count = vsm.get_count()

    if existing_count > 0 and not force_reindex:
        print(f"Index already contains {existing_count} chunks. Skipping re-indexing (use force_reindex=True to rebuild).")
        return existing_count

    print(f"Starting index build for {pdf_path}...")
    page_records = extract_pages_from_pdf(pdf_path)

    all_docs = []
    all_metas = []
    all_ids = []

    for page_num, text in page_records:
        page_chunks = chunk_page_text(page_num, text)
        for ch in page_chunks:
            all_ids.append(ch["chunk_id"])
            all_docs.append(ch["text"])
            all_metas.append({
                "page": ch["page"],
                "chunk_id": ch["chunk_id"],
                "source": PDF_FILENAME,
            })

    print(f"Total chunks created: {len(all_docs)}. Inserting into vector store...")
    vsm.add_documents(documents=all_docs, metadatas=all_metas, ids=all_ids)
    return len(all_docs)


if __name__ == "__main__":
    count = build_index()
    print(f"Index verification complete: {count} chunks indexed.")
