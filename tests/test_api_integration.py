import urllib.request
import json

def test_api():
    print("=== Testing FastAPI Endpoint: /api/status ===")
    with urllib.request.urlopen("http://localhost:8000/api/status") as resp:
        status_data = json.loads(resp.read().decode())
        print(f"Status: {status_data['status']}")
        print(f"Pages: {status_data['knowledge_base']['total_pages']}")
        print(f"Indexed Chunks: {status_data['knowledge_base']['total_indexed_chunks']}")
        assert status_data["knowledge_base"]["total_pages"] == 423
        assert status_data["knowledge_base"]["total_indexed_chunks"] == 2139

    print("\n=== Testing Chat Endpoint: Page 45 Risk Factors (RAG) ===")
    req_rag = urllib.request.Request(
        "http://localhost:8000/api/chat",
        data=json.dumps({"query": "What are the key risks mentioned on page 45 of the Annual Report?"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_rag) as resp:
        rag_data = json.loads(resp.read().decode())
        print(f"Intent: {rag_data['intent']}")
        print(f"Latency: {rag_data['execution_time_ms']} ms")
        print(f"Workflow Steps Count: {len(rag_data['workflow_trace'])}")
        for step in rag_data["workflow_trace"]:
            print(f"  - Step {step['step_number']}: {step['name']} ({step['status']})")
        cited_pages = [c["page"] for c in rag_data["citations"]]
        print(f"Cited Pages: {cited_pages}")
        assert rag_data["intent"] == "RAG_QUERY"
        assert 45 in cited_pages

    print("\n=== Testing Chat Endpoint: Schedule HR Meeting (Action) ===")
    req_act = urllib.request.Request(
        "http://localhost:8000/api/chat",
        data=json.dumps({"query": "Schedule a meeting with HR tomorrow at 10 AM regarding my leave query"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_act) as resp:
        act_data = json.loads(resp.read().decode())
        print(f"Intent: {act_data['intent']}")
        print(f"Domain: {act_data['domain']}")
        print(f"Action: {act_data['action_payload']['action']}")
        print(f"Execution ID: {act_data['action_payload']['execution_id']}")
        print(f"Mock HTTP Status: {act_data['action_payload']['mock_response']['http_status']}")
        assert act_data["intent"] == "ACTION"
        assert act_data["action_payload"]["action"] == "schedule_meeting"
        assert act_data["action_payload"]["mock_response"]["http_status"] == 200

    print("\n=== Testing Page Content Endpoint: Page 45 ===")
    with urllib.request.urlopen("http://localhost:8000/api/page/45") as resp:
        page_data = json.loads(resp.read().decode())
        print(f"Page Number: {page_data['page']}")
        print(f"Char Count: {page_data['char_count']}")
        print(f"Text Snippet: {page_data['text'][:150]}...")
        assert page_data["page"] == 45
        assert page_data["char_count"] > 100

    print("\nALL API INTEGRATION TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_api()
