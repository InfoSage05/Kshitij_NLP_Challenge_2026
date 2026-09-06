import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CHROMA_DIR = BASE_DIR / "chroma_db"
DOCS_DIR = BASE_DIR / "docs"

# PDF Source
PDF_FILENAME = "HCLTech-Annual-Report-2024-25.pdf"
PDF_PATH = DATA_DIR / PDF_FILENAME

# RAG & Embeddings
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
CHROMA_COLLECTION_NAME = "hcltech_annual_report_2024_25"
CHUNK_SIZE = 750
CHUNK_OVERLAP = 120
TOP_K_RETRIEVAL = 4

# LLM Providers
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))

# App Settings
APP_TITLE = "AegisEnterprise: Agentic Enterprise Copilot"
APP_SUBTITLE = "Digital Workplace Assistant - IT Service Desk | HR Operations | Developer Support"
