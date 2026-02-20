import uuid
from datetime import datetime, timezone
from app.services import elasticsearch_service as es_service
from app.services import jira_service


PROJECT_PREFIXES = {
    "AUTH-BACKEND": "AUTH",
    "CORE-PLATFORM": "CORE",
    "FRONTEND": "FE",
}


def create_ticket(params: dict) -> dict:
    project = params.get("project", "UNKNOWN")
    prefix = PROJECT_PREFIXES.get(project, project[:4])
    es_ticket_id = f"{prefix}-{uuid.uuid4().hex[:3].upper()}"

    # Create in Jira
    jira_result = jira_service.create_issue(
        summary=params.get("summary", ""),
        description=params.get("description", ""),
        priority=params.get("priority", "medium"),
        labels=params.get("labels", []),
    )

    jira_key = jira_result.get("jira_key")
    jira_url = jira_result.get("jira_url")

    # Use Jira key as ticket_id if available, otherwise use generated ID
    ticket_id = jira_key or es_ticket_id

    doc = {
        "ticket_id": ticket_id,
        "project": project,
        "summary": params.get("summary", ""),
        "description": params.get("description", ""),
        "priority": params.get("priority", "medium"),
        "assignee": params.get("assignee", "unassigned"),
        "team": params.get("team", ""),
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "labels": params.get("labels", []),
        "jira_key": jira_key,
        "jira_url": jira_url,
    }

    es_service.index_document("voiceops-tickets", doc)

    return {
        "ticket_id": ticket_id,
        "action": "created",
        "jira": jira_result,
        "data": doc,
    }


def update_ticket(params: dict) -> dict:
    ticket_id = params.get("ticket_id")
    updates = params.get("updates", {})

    # Update in Jira if it looks like a Jira key
    jira_result = None
    if ticket_id and jira_service.is_configured():
        jira_result = jira_service.update_issue(ticket_id, updates)

    # Update in Elasticsearch
    es_result = es_service.update_document("voiceops-tickets", ticket_id, updates)

    return {
        "ticket_id": ticket_id,
        "action": "updated",
        "changes": updates,
        "jira": jira_result,
        "elasticsearch": es_result,
    }


def log_action(command_id: str, action_type: str, tool_used: str,
               success: bool, reasoning: str, explanation: str,
               duration_ms: int, details: dict = None):
    doc = {
        "action_id": f"act-{uuid.uuid4().hex[:8]}",
        "command_id": command_id,
        "action_type": action_type,
        "tool_used": tool_used,
        "success": success,
        "reasoning": reasoning,
        "explanation": explanation,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "duration_ms": duration_ms,
        "user": "voiceops-user",
        "details": details or {},
    }
    es_service.index_document("voiceops-actions", doc)
    return doc


def log_command(command_id: str, transcript: str, intent_data: dict, status: str):
    doc = {
        "command_id": command_id,
        "raw_transcript": transcript,
        "intent": intent_data.get("intent"),
        "entities": intent_data.get("entities", {}),
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user": "voiceops-user",
    }
    es_service.index_document("voiceops-commands", doc)