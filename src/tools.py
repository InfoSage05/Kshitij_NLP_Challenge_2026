"""Enterprise Mock Action Registry & Pydantic Validation Schemas."""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Literal
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# Domain 1: IT Service Desk Schemas
# -------------------------------------------------------------
class FileITTicketSchema(BaseModel):
    category: Literal["Hardware", "Software", "VPN/Network", "Access/Identity", "Other"] = Field(
        default="Software", description="Category of IT incident"
    )
    priority: Literal["P1 - Critical", "P2 - High", "P3 - Medium", "P4 - Low"] = Field(
        default="P3 - Medium", description="Urgency priority of the ticket"
    )
    issue_summary: str = Field(..., description="Brief one-line summary of the problem")
    details: Optional[str] = Field(None, description="Detailed diagnostic or error description")
    asset_id: Optional[str] = Field(None, description="Asset tag or device serial number")


class RequestSoftwareSchema(BaseModel):
    software_name: str = Field(..., description="Name of software/tool requested, e.g., Docker Desktop, JetBrains")
    business_justification: str = Field(..., description="Why the software is required for employee work")
    duration_days: int = Field(default=90, description="Duration in days access is needed")
    license_tier: Literal["Standard", "Pro", "Enterprise"] = Field(default="Standard", description="License tier")


class CheckSystemStatusSchema(BaseModel):
    service_name: str = Field(..., description="Service or gateway to check, e.g., GlobalProtect VPN, GitHub Enterprise")
    region: Optional[str] = Field(default="APAC", description="Geographical office region")


# -------------------------------------------------------------
# Domain 2: HR Operations Schemas
# -------------------------------------------------------------
class ScheduleMeetingSchema(BaseModel):
    participant: str = Field(..., description="Person, role, or team to meet with, e.g. 'HR Partner', 'Manager'")
    topic: str = Field(..., description="Subject or purpose of the meeting")
    datetime_iso: str = Field(..., description="Date/time for meeting in ISO-8601 or natural description")
    duration_minutes: int = Field(default=30, description="Length of meeting in minutes")
    meeting_platform: Literal["Microsoft Teams", "Google Meet", "Zoom", "In-Person"] = Field(
        default="Microsoft Teams", description="Platform"
    )


class ApplyLeaveSchema(BaseModel):
    leave_type: Literal["Paid Time Off (PTO)", "Sick Leave", "Casual Leave", "Paternity/Maternity", "Unpaid Leave"] = Field(
        default="Paid Time Off (PTO)", description="Type of leave"
    )
    start_date: str = Field(..., description="Start date (YYYY-MM-DD or relative)")
    end_date: str = Field(..., description="End date (YYYY-MM-DD or relative)")
    reason: str = Field(..., description="Reason for the leave request")
    emergency_contact: Optional[str] = Field(None, description="Emergency contact phone or email")


class QueryBenefitsPolicySchema(BaseModel):
    benefit_category: Literal["Health Insurance", "Retirement/PF", "Wellness Allowance", "Relocation", "Education/Upskilling"] = Field(
        ..., description="Category of benefit inquiry"
    )
    employee_level: Optional[str] = Field(default="Standard", description="Employee seniority band")


# -------------------------------------------------------------
# Domain 3: Developer Support Schemas
# -------------------------------------------------------------
class CreateGitHubIssueSchema(BaseModel):
    repository: str = Field(..., description="Repository name, e.g., 'hcl-cloud/infra-core'")
    title: str = Field(..., description="Issue title")
    issue_type: Literal["Bug", "Feature", "Documentation", "Performance"] = Field(default="Bug", description="Type of issue")
    stack_trace: Optional[str] = Field(None, description="Error logs or tracebacks")
    reproduction_steps: Optional[str] = Field(None, description="Steps to reproduce")


class SearchCodeDocsSchema(BaseModel):
    repository: str = Field(..., description="Target repository or documentation archive")
    query: str = Field(..., description="Search keyword, function name, or architectural module")
    language: Optional[str] = Field(default="Python", description="Programming language filter")


class SuggestCodeFixSchema(BaseModel):
    code_snippet: str = Field(..., description="Problematic code block")
    error_log: Optional[str] = Field(None, description="Console error or runtime exception trace")


# -------------------------------------------------------------
# Tool Execution Registry
# -------------------------------------------------------------
TOOL_SCHEMAS = {
    # IT Service Desk
    "file_it_ticket": (FileITTicketSchema, "it_service_desk"),
    "request_software": (RequestSoftwareSchema, "it_service_desk"),
    "check_system_status": (CheckSystemStatusSchema, "it_service_desk"),
    # HR Operations
    "schedule_meeting": (ScheduleMeetingSchema, "hr_operations"),
    "apply_leave": (ApplyLeaveSchema, "hr_operations"),
    "query_benefits_policy": (QueryBenefitsPolicySchema, "hr_operations"),
    # Developer Support
    "create_github_issue": (CreateGitHubIssueSchema, "developer_support"),
    "search_code_docs": (SearchCodeDocsSchema, "developer_support"),
    "suggest_code_fix": (SuggestCodeFixSchema, "developer_support"),
}


def execute_mock_action(tool_name: str, raw_arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Validates parameters against Pydantic schema and returns standardized JSON payload."""
    if tool_name not in TOOL_SCHEMAS:
        return {
            "status": "ERROR",
            "error_code": "TOOL_NOT_FOUND",
            "message": f"Action '{tool_name}' is not registered in enterprise tools.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    schema_cls, domain = TOOL_SCHEMAS[tool_name]
    try:
        validated_data = schema_cls(**raw_arguments).model_dump()
    except Exception as e:
        return {
            "status": "VALIDATION_FAILED",
            "domain": domain,
            "tool_name": tool_name,
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    execution_id = f"ACT-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.now(timezone.utc).isoformat()

    return {
        "status": "SUCCESS",
        "domain": domain,
        "action": tool_name,
        "execution_id": execution_id,
        "timestamp": now_str,
        "parameters": validated_data,
        "mock_response": {
            "http_status": 200,
            "message": f"Action '{tool_name}' successfully executed by AegisEnterprise agent.",
            "reference_id": f"REF-{execution_id}",
        },
    }
