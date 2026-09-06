"""ChromaDB Vector Store interface with sentence-transformers embedding."""

import os
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

from src.config import (
    CHROMA_DIR,
    CHROMA_COLLECTION_NAME,
    EMBEDDING_MODEL_NAME,
    TOP_K_RETRIEVAL,
)

# Global cached embedding model
_EMBED_MODEL: Optional[SentenceTransformer] = None


def get_embedding_model() -> SentenceTransformer:
    global _EMBED_MODEL
    if _EMBED_MODEL is None:
        print(f"Loading embedding model: {EMBEDDING_MODEL_NAME}...")
        _EMBED_MODEL = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _EMBED_MODEL


class VectorStoreManager:
    def __init__(self, persist_dir: Optional[str] = None):
        self.persist_dir = str(persist_dir or CHROMA_DIR)
        os.makedirs(self.persist_dir, exist_ok=True)
        self.client = chromadb.PersistentClient(
            path=self.persist_dir,
            settings=Settings(anonymized_telemetry=False),
        )
        self.collection = self.client.get_or_create_collection(
            name=CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        self.embed_model = get_embedding_model()

    def get_count(self) -> int:
        return self.collection.count()

    def add_documents(
        self,
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        ids: List[str],
        batch_size: int = 128,
    ):
        """Encodes and inserts documents in batches into ChromaDB."""
        total = len(documents)
        print(f"Inserting {total} document chunks into ChromaDB...")

        for i in range(0, total, batch_size):
            end_idx = min(i + batch_size, total)
            batch_docs = documents[i:end_idx]
            batch_meta = metadatas[i:end_idx]
            batch_ids = ids[i:end_idx]

            batch_embeddings = self.embed_model.encode(
                batch_docs,
                batch_size=batch_size,
                show_progress_bar=False,
                convert_to_numpy=True,
            ).tolist()

            self.collection.upsert(
                ids=batch_ids,
                embeddings=batch_embeddings,
                documents=batch_docs,
                metadatas=batch_meta,
            )
            print(f"  Indexed chunks {i+1} to {end_idx} of {total}...")

        print("ChromaDB indexing complete!")

    def query(
        self,
        query_text: str,
        top_k: int = TOP_K_RETRIEVAL,
        page_filter: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Searches vector store for semantically similar chunks with page citations."""
        if self.collection.count() == 0:
            return []

        query_embedding = self.embed_model.encode([query_text], convert_to_numpy=True).tolist()

        where_clause = None
        if page_filter is not None:
            where_clause = {"page": int(page_filter)}

        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=min(top_k, self.collection.count()),
            where=where_clause,
            include=["documents", "metadatas", "distances"],
        )

        formatted_results = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            dists = results["distances"][0]

            for doc, meta, dist in zip(docs, metas, dists):
                formatted_results.append({
                    "content": doc,
                    "page": meta.get("page", 1),
                    "chunk_id": meta.get("chunk_id", ""),
                    "source": meta.get("source", ""),
                    "similarity_score": round(1.0 - dist, 4) if dist is not None else 1.0,
                })

        return formatted_results
