"""Enterprise Agentic Orchestrator for RAG and Autonomous Function Calling."""

import json
import re
import time
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from src.config import (
    OPENAI_API_KEY,
    GROQ_API_KEY,
    GEMINI_API_KEY,
)
from src.tools import execute_mock_action, TOOL_SCHEMAS
from src.vector_store import VectorStoreManager


@dataclass
class AgentResponse:
    reply_text: str
    action_payload: Optional[Dict[str, Any]] = None
    citations: List[Dict[str, Any]] = field(default_factory=list)
    intent: str = "GENERAL"
    domain: str = "general"
    execution_time_ms: float = 0.0
    tool_triggered: Optional[str] = None


class AegisAgent:
    def __init__(self, api_key: Optional[str] = None, provider: str = "auto"):
        self.api_key = api_key or OPENAI_API_KEY or GROQ_API_KEY or GEMINI_API_KEY
        self.provider = provider
        self.vector_store = VectorStoreManager()
        self._openai_client = None

        if self.api_key:
            try:
                from openai import OpenAI
                self._openai_client = OpenAI(api_key=self.api_key)
            except Exception as e:
                print(f"Notice: OpenAI client init failed ({e}). Fallback to local agent engine.")

    def _detect_page_in_query(self, query: str) -> Optional[int]:
        """Detects if user explicitly mentions a page number like 'page 45' or 'page 120'."""
        match = re.search(r"\bpage\s*(\d+)\b", query, re.IGNORECASE)
        if match:
            return int(match.group(1))
        return None

    def _parse_offline_action(self, prompt: str) -> Optional[Dict[str, Any]]:
        """High-precision regex and semantic extractor for offline hackathon action execution."""
        p_lower = prompt.lower()

        # 1. Schedule Meeting
        if (
            re.search(r"\b(schedule|book|set\s*up|organize)\b.*\b(meeting|sync|call|appointment|calendar)\b", p_lower)
            or "meeting with hr" in p_lower
            or "sync with" in p_lower
        ):
            participant = "HR Business Partner"
            if "with hr" in p_lower or " hr" in p_lower:
                participant = "HR Business Partner"
            elif "manager" in p_lower:
                participant = "Reporting Manager"
            elif "team" in p_lower:
                participant = "Engineering Team"

            time_iso = "2026-09-07T10:00:00Z"
            if "tomorrow" in p_lower:
                time_iso = "Tomorrow, 10:00 AM"
            elif "friday" in p_lower:
                time_iso = "This Friday, 02:00 PM"

            topic = "General Workplace Discussion"
            if "regarding" in p_lower:
                topic = prompt.split("regarding")[-1].strip()
            elif "about" in p_lower:
                topic = prompt.split("about")[-1].strip()

            args = {
                "participant": participant,
                "topic": topic.capitalize(),
                "datetime_iso": time_iso,
                "duration_minutes": 30,
                "meeting_platform": "Microsoft Teams",
            }
            return {"tool": "schedule_meeting", "args": args}

        # 2. File IT Ticket
        if (
            re.search(r"\b(file|create|raise|log|submit|open)\b.*\bticket\b", p_lower)
            or any(w in p_lower for w in ["it ticket", "vpn failure", "vpn not working", "vpn connection failure", "hardware issue", "laptop broken", "password reset"])
        ):
            category = "Software"
            priority = "P3 - Medium"
            if "vpn" in p_lower or "network" in p_lower or "wifi" in p_lower or "internet" in p_lower:
                category = "VPN/Network"
                priority = "P2 - High"
            elif "laptop" in p_lower or "monitor" in p_lower or "keyboard" in p_lower or "hardware" in p_lower:
                category = "Hardware"
            elif "access" in p_lower or "password" in p_lower or "permission" in p_lower:
                category = "Access/Identity"

            if "urgent" in p_lower or "critical" in p_lower or "p1" in p_lower:
                priority = "P1 - Critical"

            args = {
                "category": category,
                "priority": priority,
                "issue_summary": prompt.strip()[:100],
                "details": f"Employee reported: {prompt.strip()}",
                "asset_id": "HCL-WRK-94821",
            }
            return {"tool": "file_it_ticket", "args": args}

        # 3. Request Software Access
        if (
            re.search(r"\b(request|need|install|provision|get)\b.*\b(software|access|license|tool)\b", p_lower)
            or any(w in p_lower for w in ["docker desktop", "jetbrains", "pycharm", "vscode", "postman", "license for"])
        ):
            software = "Enterprise Developer Suite"
            for sw in ["Docker Desktop", "JetBrains PyCharm", "Postman Enterprise", "GitHub Copilot", "Tableau", "AWS CLI"]:
                if sw.lower() in p_lower:
                    software = sw
                    break

            args = {
                "software_name": software,
                "business_justification": f"Required for project sprint task ({prompt.strip()})",
                "duration_days": 90,
                "license_tier": "Standard",
            }
            return {"tool": "request_software", "args": args}

        # 4. Apply Leave
        if (
            re.search(r"\b(apply|request|take)\b.*\b(leave|pto|vacation|time\s*off|sick\s*day)\b", p_lower)
            or any(w in p_lower for w in ["sick leave", "casual leave", "pto request"])
        ):
            leave_type = "Paid Time Off (PTO)"
            if "sick" in p_lower:
                leave_type = "Sick Leave"
            elif "casual" in p_lower:
                leave_type = "Casual Leave"

            args = {
                "leave_type": leave_type,
                "start_date": "2026-09-10",
                "end_date": "2026-09-12",
                "reason": prompt.strip(),
                "emergency_contact": "+91-9876543210",
            }
            return {"tool": "apply_leave", "args": args}

        # 5. Create GitHub Issue
        if (
            re.search(r"\b(create|file|log|open)\b.*\b(github\s+issue|bug\s+report|issue)\b", p_lower)
            or any(w in p_lower for w in ["github issue", "log bug", "file bug"])
        ):
            args = {
                "repository": "hcltech-enterprise/core-services",
                "title": prompt.strip()[:60],
                "issue_type": "Bug",
                "stack_trace": "NullPointerException at com.hcl.auth.Service.verify(Auth.java:42)",
                "reproduction_steps": "1. Login to endpoint\n2. Trigger auth token refresh\n3. Observe timeout",
            }
            return {"tool": "create_github_issue", "args": args}

        # 6. Check System Status
        if (
            re.search(r"\b(status|health|check)\b.*\b(system|vpn|service|server|network)\b", p_lower)
            or "is vpn up" in p_lower
        ):
            args = {
                "service_name": "GlobalProtect VPN Gateway",
                "region": "APAC - Noida SEZ",
            }
            return {"tool": "check_system_status", "args": args}

        return None

    def process_query(self, user_prompt: str, domain_filter: Optional[str] = None) -> AgentResponse:
        """Main entry point: analyzes intent, performs RAG or action dispatch, and formats output."""
        start_time = time.time()
        user_prompt = user_prompt.strip()

        # Step 1: Check for explicit or implicit action triggers
        action_match = self._parse_offline_action(user_prompt)

        if action_match:
            tool_name = action_match["tool"]
            args = action_match["args"]
            payload = execute_mock_action(tool_name, args)

            reply = (
                f"### Autonomous Action Executed: `{tool_name}`\n\n"
                f"I have triggered the requested enterprise operation through the **{payload.get('domain', 'enterprise')}** gateway.\n\n"
                f"- **Reference ID**: `{payload.get('mock_response', {}).get('reference_id', 'N/A')}`\n"
                f"- **Status**: `{payload.get('status', 'SUCCESS')} (HTTP 200 OK)`\n"
                f"- **Timestamp**: `{payload.get('timestamp')}`\n\n"
                f"The structured JSON action payload has been generated and is displayed in the **Action Inspector** on the right."
            )

            latency = (time.time() - start_time) * 1000
            return AgentResponse(
                reply_text=reply,
                action_payload=payload,
                citations=[],
                intent="ACTION",
                domain=payload.get("domain", "enterprise"),
                execution_time_ms=round(latency, 1),
                tool_triggered=tool_name,
            )

        # Step 2: Document / Financial / Policy RAG Search
        page_filter = self._detect_page_in_query(user_prompt)
        chunks = self.vector_store.query(
            query_text=user_prompt,
            top_k=4,
            page_filter=page_filter,
        )

        # If page_filter returned nothing (e.g. chunk on that page had slightly different phrasing), query without filter
        if page_filter is not None and not chunks:
            chunks = self.vector_store.query(query_text=user_prompt, top_k=4)

        if not chunks:
            latency = (time.time() - start_time) * 1000
            return AgentResponse(
                reply_text=(
                    "I searched the enterprise knowledge base (HCLTech Annual Integrated Report 2024-25), "
                    "but no matching passages were found. Please verify the query or ensure the vector index is loaded."
                ),
                citations=[],
                intent="RAG_QUERY",
                domain="annual_report",
                execution_time_ms=round(latency, 1),
            )

        # Build grounded response with citations
        citations = []
        context_snippets = []
        cited_pages = set()

        for idx, chunk in enumerate(chunks):
            page_num = chunk["page"]
            cited_pages.add(page_num)
            snippet = chunk["content"]
            citations.append({
                "citation_id": idx + 1,
                "page": page_num,
                "score": chunk["similarity_score"],
                "text": snippet,
                "source": chunk["source"],
            })
            context_snippets.append(f"--- [Page {page_num}] ---\n{snippet}")

        joined_context = "\n\n".join(context_snippets[:3])
        sorted_pages = sorted(list(cited_pages))
        page_tags = ", ".join([f"**[Page {p}]**" for p in sorted_pages])

        # Synthesize clear answer
        lead_chunk = chunks[0]["content"]
        # Format key sentences
        sentences = [s.strip() for s in lead_chunk.split("\n") if len(s.strip()) > 30]
        summary_bullets = "\n".join([f"- {s}" for s in sentences[:4]]) if sentences else f"- {lead_chunk[:250]}..."

        reply = (
            f"### Grounded Response from HCLTech Annual Report 2024-25\n\n"
            f"Based on the official corporate filings in the report ({page_tags}):\n\n"
            f"{summary_bullets}\n\n"
            f"> **Page Citation**: Found on {page_tags} of *HCLTech Annual Integrated Report 2024-25*."
        )

        latency = (time.time() - start_time) * 1000
        return AgentResponse(
            reply_text=reply,
            action_payload=None,
            citations=citations,
            intent="RAG_QUERY",
            domain="annual_report",
            execution_time_ms=round(latency, 1),
        )
