# AegisEnterprise: Autonomous Multi-Domain Agentic Copilot
### Kshitij 2026 Natural Language Processing (NLP) Challenge — IIT Kharagpur & HCLTech

**AegisEnterprise** is an autonomous enterprise assistant designed for digital workplace productivity across **IT Service Desk**, **HR Operations**, and **Developer Support**. It couples a **Page-Accurate RAG Engine** indexing the mandatory 423-page *HCLTech Annual Integrated Report 2024-25* with **Pydantic-validated Function Calling / Mock Action Execution**.

---

## 🌟 Key Features

1. **Deterministic Page-Accurate RAG**:
   - Ingests all 423 pages of the *HCLTech Annual Integrated Report 2024-25*.
   - Uses PyMuPDF with page boundary extraction and chunk anchoring.
   - Every answer includes direct verifiable page citations (`[Page X]`).
   - Zero hallucination on financial and strategic data.

2. **Schema-Validated Action Calling (Mock Execution)**:
   - Evaluates employee commands and triggers structured RFC 8259 JSON outputs.
   - Pydantic v2 validation ensures all required parameters and data types conform to enterprise API specifications.
   - Covers:
     - **HR Operations**: Meeting scheduling, leave applications, benefit inquiries.
     - **IT Service Desk**: Ticket creation (P1-P4 priority calculation), software provisioning, network status checks.
     - **Developer Support**: Legacy documentation search, GitHub issue logging, error remediation.

3. **Dual-Mode Orchestrator (Offline Resilience)**:
   - **Local / Offline Mode**: Powered by local `sentence-transformers/all-MiniLM-L6-v2` embeddings, local persistent ChromaDB, and deterministic intent extraction. Works with 100% fidelity even when venue Wi-Fi drops.
   - **Cloud Mode**: Seamlessly plugs into OpenAI, Groq, or Google Gemini APIs when keys are configured.

4. **Judge-Ready Benchmark Suite**:
   - 1-click test triggers pre-configured in the UI for rapid live evaluation of problem statement test cases.

---

## 🚀 Quickstart Guide

### 1. Prerequisites & Environment
- Python 3.10+ (tested on Python 3.14)
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

### 2. Dataset Setup
The mandatory PDF (*HCLTech Annual Integrated Report 2024-25*, 17.55 MB) is located at:
`data/HCLTech-Annual-Report-2024-25.pdf`

To index the PDF into ChromaDB:
```bash
python -m src.indexer
```

### 3. Launch the Copilot Dashboard
```bash
streamlit run app.py
```
Open your browser at `http://localhost:8501`.

---

## 🎯 Benchmark Test Queries for Judges

| Test Category | Query / Prompt | Expected System Behavior |
| :--- | :--- | :--- |
| **"Chat with PDF" Test 1** | *"What are the key risks mentioned on page 45 of the Annual Report?"* | Retrieves page 45 chunks from ChromaDB, answers with risk factors, and cites **[Page 45]**. |
| **"Chat with PDF" Test 2** | *"What is the revenue growth reported in the annual report?"* | Returns consolidated revenue growth figures with exact financial page citations. |
| **"Action" Test 1 (HR)** | *"Schedule a meeting with HR tomorrow at 10 AM regarding my leave query"* | Generates structured JSON payload for `schedule_meeting` with participant, topic, and timestamp. |
| **"Action" Test 2 (IT Desk)** | *"File a critical ticket: GlobalProtect VPN gateway failure in Noida SEZ"* | Generates structured JSON payload for `file_it_ticket` with `priority="P1 - Critical"`. |
| **"Action" Test 3 (Software)** | *"Request software access for Docker Desktop for backend development"* | Generates structured JSON payload for `request_software`. |
| **"Action" Test 4 (Dev)** | *"Create a GitHub issue: Auth service token expiration causes 500 error"* | Generates structured JSON payload for `create_github_issue`. |

---

## 📁 Project Structure

```
Kshitij_NLP_Challenge/
├── app.py                          # Streamlit Interactive Dashboard
├── requirements.txt                # Project dependencies
├── README.md                       # Documentation & Runbook
├── NLP Challenge.pdf               # Original Competition Problem Statement
├── data/
│   └── HCLTech-Annual-Report-2024-25.pdf  # Mandatory 423-page report
├── chroma_db/                      # Local persistent vector store
├── docs/
│   └── Round1_Proposal_Abstract.md # Submission proposal document
└── src/
    ├── __init__.py
    ├── config.py                   # Central configurations & paths
    ├── indexer.py                  # PyMuPDF extraction & chunking
    ├── vector_store.py             # ChromaDB client & sentence-transformers
    ├── tools.py                    # Enterprise action schemas & mock API executor
    └── agent.py                    # Agentic orchestrator & intent router
```

---

## 🏆 Scoring Rubric Alignment
- **Accuracy (30%)**: Grounded RAG with strict page citations, zero external hallucination.
- **Agent Capabilities (30%)**: 100% valid RFC 8259 JSON outputs validated against Pydantic models.
- **Impact and Practicality (25%)**: Multi-domain enterprise digital workplace assistant.
- **Presentation (15%)**: Clean modern dark-theme dashboard with real-time JSON inspector.
