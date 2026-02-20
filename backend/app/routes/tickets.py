from fastapi import APIRouter
from app.models import TicketUpdate
from app.services import elasticsearch_service as es_service
from app.services import jira_service

router = APIRouter(prefix="/api", tags=["tickets"])


@router.get("/tickets")
async def get_tickets():
    tickets = es_service.get_all_tickets()
    return {"tickets": tickets, "total": len(tickets)}


@router.post("/tickets/update")
async def update_ticket(update: TicketUpdate):
    jira_result = None
    if jira_service.is_configured():
        jira_result = jira_service.update_issue(update.ticket_id, update.updates)

    es_result = es_service.update_document("voiceops-tickets", update.ticket_id, update.updates)

    return {"elasticsearch": es_result, "jira": jira_result}


@router.get("/tickets/jira/{issue_key}")
async def get_jira_issue(issue_key: str):
    return jira_service.get_issue(issue_key)


@router.get("/tickets/jira-search")
async def search_jira(query: str):
    return jira_service.search_issues(query)


@router.get("/audit-log")
async def get_audit_log():
    actions = es_service.get_all_actions()
    return {"actions": actions, "total": len(actions)}

@router.get("/tickets/jira-test")
async def test_jira():
    from app.config import JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY

    config_status = {
        "jira_domain": JIRA_DOMAIN or "NOT SET",
        "jira_email": JIRA_EMAIL or "NOT SET",
        "jira_api_token": "SET" if JIRA_API_TOKEN else "NOT SET",
        "jira_project_key": JIRA_PROJECT_KEY or "NOT SET",
        "is_configured": jira_service.is_configured(),
    }

    # Try creating a test ticket
    if jira_service.is_configured():
        test_result = jira_service.create_issue(
            summary="[TEST] VoiceOps Agent Connection Test",
            description="This is a test ticket from VoiceOps Agent. Safe to delete.",
            priority="low",
            labels=["voiceops-test"],
        )
        config_status["test_create"] = test_result
    else:
        config_status["test_create"] = "Skipped — Jira not configured"

    return config_status

@router.get("/tickets/jira-projects")
async def list_jira_projects():
    import requests
    from requests.auth import HTTPBasicAuth
    from app.config import JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN

    try:
        response = requests.get(
            f"https://{JIRA_DOMAIN}/rest/api/3/project",
            auth=HTTPBasicAuth(JIRA_EMAIL, JIRA_API_TOKEN),
            headers={"Accept": "application/json"},
            timeout=10,
        )
        response.raise_for_status()
        projects = response.json()

        return [
            {
                "key": p["key"],
                "name": p["name"],
                "id": p["id"],
            }
            for p in projects
        ]
    except Exception as e:
        return {"error": str(e)}