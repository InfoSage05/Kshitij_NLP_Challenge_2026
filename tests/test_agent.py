"""Automated test suite for AegisEnterprise Copilot."""

import unittest
from src.tools import execute_mock_action, TOOL_SCHEMAS
from src.agent import AegisAgent


class TestEnterpriseTools(unittest.TestCase):
    def test_file_it_ticket_success(self):
        result = execute_mock_action("file_it_ticket", {
            "category": "VPN/Network",
            "priority": "P1 - Critical",
            "issue_summary": "VPN Gateway timed out",
            "details": "Employees unable to authenticate to intranet",
            "asset_id": "ASSET-1029",
        })
        self.assertEqual(result["status"], "SUCCESS")
        self.assertEqual(result["domain"], "it_service_desk")
        self.assertEqual(result["parameters"]["priority"], "P1 - Critical")
        self.assertTrue(result["execution_id"].startswith("ACT-"))

    def test_schedule_meeting_success(self):
        result = execute_mock_action("schedule_meeting", {
            "participant": "HR Business Partner",
            "topic": "Benefits Query",
            "datetime_iso": "2026-09-08T11:00:00Z",
            "duration_minutes": 30,
            "meeting_platform": "Microsoft Teams",
        })
        self.assertEqual(result["status"], "SUCCESS")
        self.assertEqual(result["domain"], "hr_operations")
        self.assertEqual(result["parameters"]["duration_minutes"], 30)

    def test_request_software_success(self):
        result = execute_mock_action("request_software", {
            "software_name": "Docker Desktop",
            "business_justification": "Required for building local containers",
            "duration_days": 60,
            "license_tier": "Standard",
        })
        self.assertEqual(result["status"], "SUCCESS")
        self.assertEqual(result["domain"], "it_service_desk")

    def test_invalid_tool_name(self):
        result = execute_mock_action("non_existent_tool", {})
        self.assertEqual(result["status"], "ERROR")
        self.assertEqual(result["error_code"], "TOOL_NOT_FOUND")


class TestAgentOrchestration(unittest.TestCase):
    def setUp(self):
        self.agent = AegisAgent()

    def test_hr_action_trigger(self):
        res = self.agent.process_query("Schedule a meeting with HR tomorrow at 10 AM regarding my leave")
        self.assertEqual(res.intent, "ACTION")
        self.assertEqual(res.domain, "hr_operations")
        self.assertIsNotNone(res.action_payload)
        self.assertEqual(res.action_payload["action"], "schedule_meeting")

    def test_it_ticket_action_trigger(self):
        res = self.agent.process_query("File a critical ticket: VPN connection failure in Noida office")
        self.assertEqual(res.intent, "ACTION")
        self.assertEqual(res.domain, "it_service_desk")
        self.assertIsNotNone(res.action_payload)
        self.assertEqual(res.action_payload["action"], "file_it_ticket")

    def test_software_request_action_trigger(self):
        res = self.agent.process_query("Request software access for Docker Desktop for backend development")
        self.assertEqual(res.intent, "ACTION")
        self.assertEqual(res.action_payload["action"], "request_software")

    def test_page_number_regex_detection(self):
        page = self.agent._detect_page_in_query("What are the risks on page 45?")
        self.assertEqual(page, 45)


if __name__ == "__main__":
    unittest.main()
