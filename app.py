"""AegisEnterprise: Autonomous Agentic Workplace Copilot (Kshitij 2026 NLP Challenge)."""

import json
import streamlit as st
from datetime import datetime

from src.agent import AegisAgent
from src.tools import TOOL_SCHEMAS

# -------------------------------------------------------------
# Page Configuration & Custom Theme
# -------------------------------------------------------------
st.set_page_config(
    page_title="AegisEnterprise Copilot",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(
    """
    <style>
    /* Dark enterprise theme overrides */
    .stApp {
        background-color: #0d1117;
        color: #e6edf3;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .main-header {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        border: 1px solid #374151;
        border-radius: 12px;
        padding: 18px 24px;
        margin-bottom: 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .header-title {
        font-size: 26px;
        font-weight: 700;
        color: #60a5fa;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .header-subtitle {
        font-size: 14px;
        color: #9ca3af;
    }
    .citation-badge {
        display: inline-block;
        background-color: #1e3a8a;
        color: #93c5fd;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        margin-right: 6px;
        border: 1px solid #3b82f6;
    }
    .action-card {
        background-color: #161b22;
        border: 1px solid #30363d;
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 16px;
    }
    .domain-tag {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 4px;
    }
    .tag-it { background: #1e293b; color: #38bdf8; border: 1px solid #0284c7; }
    .tag-hr { background: #2e1065; color: #c084fc; border: 1px solid #9333ea; }
    .tag-dev { background: #064e3b; color: #34d399; border: 1px solid #059669; }
    .tag-rag { background: #451a03; color: #fbbf24; border: 1px solid #d97706; }
    </style>
    """,
    unsafe_allow_html=True,
)

# -------------------------------------------------------------
# Agent Initialization
# -------------------------------------------------------------
@st.cache_resource
def get_agent():
    return AegisAgent()

agent = get_agent()

# Session State Initialization
if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": (
                "👋 **Welcome to AegisEnterprise Copilot!**\n\n"
                "I am your autonomous enterprise copilot for **HCLTech** operations. I can:\n"
                "1. **Answer document queries** with exact page citations from the *HCLTech Annual Report 2024-25* (423 pages).\n"
                "2. **Execute enterprise actions** (Schedule HR syncs, file IT tickets, provision software, log GitHub issues).\n\n"
                "Try asking a question or click any benchmark test in the sidebar!"
            ),
            "citations": [],
            "action_payload": None,
        }
    ]

if "last_action_payload" not in st.session_state:
    st.session_state.last_action_payload = None

# -------------------------------------------------------------
# Top Header
# -------------------------------------------------------------
st.markdown(
    """
    <div class="main-header">
        <div class="header-title">🏢 AegisEnterprise Copilot</div>
        <div class="header-subtitle">
            Autonomous Multi-Domain Agentic Workplace Assistant | Kshitij 2026 NLP Challenge (IIT Kharagpur & HCLTech)
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# -------------------------------------------------------------
# Sidebar: Configuration, Benchmark Suite & System Status
# -------------------------------------------------------------
with st.sidebar:
    st.header("⚙️ Copilot Controls")

    domain_choice = st.selectbox(
        "Focus Domain Filter",
        ["Unified Enterprise (All Domains)", "HR Operations", "IT Service Desk", "Developer Support", "Annual Report RAG"],
        index=0,
    )

    st.markdown("---")
    st.subheader("🎯 Judge Benchmark Suite")
    st.caption("1-Click triggers for live competition evaluation:")

    selected_prompt = None
    if st.button("📄 Test 1: Page 45 Risk Factors", use_container_width=True):
        selected_prompt = "What are the key risks mentioned on page 45 of the Annual Report?"

    if st.button("📈 Test 2: Revenue Growth FY25", use_container_width=True):
        selected_prompt = "What is the revenue growth and financial performance reported?"

    if st.button("🤝 Action 1: Schedule Meeting with HR", use_container_width=True):
        selected_prompt = "Schedule a meeting with HR tomorrow at 10 AM regarding my leave query"

    if st.button("🎫 Action 2: File Critical IT Ticket", use_container_width=True):
        selected_prompt = "File a critical ticket: GlobalProtect VPN gateway failure in Noida SEZ"

    if st.button("💻 Action 3: Request Docker Access", use_container_width=True):
        selected_prompt = "Request software access for Docker Desktop for backend development"

    if st.button("🐛 Action 4: Create GitHub Bug Issue", use_container_width=True):
        selected_prompt = "Create a GitHub issue: Auth service token expiration causes 500 error"

    st.markdown("---")
    st.subheader("📊 Knowledge Base Status")
    try:
        doc_count = agent.vector_store.get_count()
        st.success(f"ChromaDB Status: **Active**\n\nIndexed Chunks: **{doc_count:,}**")
    except Exception as e:
        st.warning(f"Vector Store: Initializing... ({e})")

    st.caption("Dataset: HCLTech Annual Integrated Report 2024-25 (423 pages, 17.55 MB)")

# -------------------------------------------------------------
# Main Layout: Dual-Pane Workspace
# -------------------------------------------------------------
col_chat, col_inspector = st.columns([6, 5], gap="large")

# --- Left Column: Conversational Workspace ---
with col_chat:
    st.subheader("💬 Workplace Chat")

    # Display message history
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            if msg.get("citations"):
                st.markdown("**Verifiable Source Citations:**")
                for cit in msg["citations"]:
                    with st.expander(f"📍 Page {cit['page']} (Similarity: {cit['score']:.2f})"):
                        st.markdown(f"*{cit['text']}*")

    # Handle user input from chat box or benchmark button
    user_input = st.chat_input("Ask a question or request an action (e.g., 'Schedule meeting with HR')...")
    prompt_to_run = selected_prompt or user_input

    if prompt_to_run:
        # Append and display user message
        st.session_state.messages.append({"role": "user", "content": prompt_to_run})
        with st.chat_message("user"):
            st.markdown(prompt_to_run)

        # Process with agent
        with st.chat_message("assistant"):
            with st.spinner("Analyzing intent and querying enterprise knowledge base..."):
                response = agent.process_query(prompt_to_run)

            st.markdown(response.reply_text)

            # Display citations if available
            if response.citations:
                st.markdown("**Verifiable Source Citations:**")
                for cit in response.citations:
                    with st.expander(f"📍 Page {cit['page']} (Confidence: {cit['score']:.2f})"):
                        st.markdown(f"*{cit['text']}*")

            # Update session state
            st.session_state.messages.append({
                "role": "assistant",
                "content": response.reply_text,
                "citations": response.citations,
                "action_payload": response.action_payload,
            })
            if response.action_payload:
                st.session_state.last_action_payload = response.action_payload

            st.caption(f"⏱️ Response Latency: {response.execution_time_ms} ms | Intent: `{response.intent}`")

# --- Right Column: Action & JSON Payload Inspector ---
with col_inspector:
    st.subheader("⚡ Function Calling & Action Inspector")
    st.caption("Live validation of structured RFC 8259 JSON outputs for enterprise automation:")

    active_payload = st.session_state.last_action_payload

    if active_payload:
        domain = active_payload.get("domain", "enterprise")
        action_name = active_payload.get("action", "unknown_action")
        status = active_payload.get("status", "SUCCESS")
        exec_id = active_payload.get("execution_id", "ACT-0000")

        badge_class = {
            "it_service_desk": "tag-it",
            "hr_operations": "tag-hr",
            "developer_support": "tag-dev",
        }.get(domain, "tag-rag")

        st.markdown(
            f"""
            <div class="action-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                    <span class="domain-tag {badge_class}">{domain.replace('_', ' ')}</span>
                    <span style="color:#10b981; font-weight:700; font-size:12px;">● {status} (HTTP 200)</span>
                </div>
                <div style="font-size:16px; font-weight:600; color:#f3f4f6;">Action: <code>{action_name}</code></div>
                <div style="font-size:12px; color:#9ca3af; margin-top:2px;">Execution ID: <code>{exec_id}</code></div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.markdown("**Validated JSON Payload:**")
        st.json(active_payload, expanded=True)

        col_b1, col_b2 = st.columns(2)
        with col_b1:
            st.download_button(
                "📥 Export JSON",
                data=json.dumps(active_payload, indent=2),
                file_name=f"{action_name}_{exec_id}.json",
                mime="application/json",
                use_container_width=True,
            )
        with col_b2:
            if st.button("🔄 Clear Active Action", use_container_width=True):
                st.session_state.last_action_payload = None
                st.rerun()
    else:
        st.info(
            "ℹ️ **No Action Triggered Yet**\n\n"
            "Trigger any mock enterprise action to inspect the generated JSON schema payload in real time.\n\n"
            "**Examples to try:**\n"
            "- *'Schedule a meeting with HR tomorrow at 10 AM'*\n"
            "- *'File an IT ticket for broken monitor'*\n"
            "- *'Request software access for JetBrains PyCharm'*\n"
            "- *'Create a GitHub issue for login bug'*"
        )

        with st.expander("🔍 View Registered Enterprise Tool Schemas"):
            st.markdown("AegisEnterprise provides strict Pydantic v2 validation for the following tools:")
            for tool_name, (schema_cls, domain) in TOOL_SCHEMAS.items():
                st.markdown(f"- **`{tool_name}`** (`{domain}`)")
