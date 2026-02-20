import requests
from requests.auth import HTTPBasicAuth
from app.config import JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY

BASE_URL = f"https://{JIRA_DOMAIN}/rest/api/3"
AUTH = HTTPBasicAuth(JIRA_EMAIL, JIRA_API_TOKEN)
HEADERS = {"Accept": "application/json", "Content-Type": "application/json"}

PRIORITY_MAP = {
    "critical": "Highest",
    "high": "High",
    "medium": "Medium",
    "low": "Low",
}

# Cache for issue types (avoid repeated API calls)
_issue_type_cache = None


def is_configured() -> bool:
    return bool(JIRA_DOMAIN and JIRA_EMAIL and JIRA_API_TOKEN)


def _get_default_issue_type() -> str | None:
    """Get the first valid issue type for the project (excluding subtasks)."""
    global _issue_type_cache
    
    if _issue_type_cache:
        return _issue_type_cache
    
    try:
        response = requests.get(
            f"{BASE_URL}/project/{JIRA_PROJECT_KEY}",
            auth=AUTH,
            headers=HEADERS,
            timeout=10,
        )
        response.raise_for_status()
        project = response.json()
        
        # Prefer these types in order
        preferred_types = ["Task", "Story", "Bug", "Issue"]
        available_types = [it["name"] for it in project.get("issueTypes", []) if not it.get("subtask")]
        
        # Return first matching preferred type
        for pref in preferred_types:
            if pref in available_types:
                _issue_type_cache = pref
                return pref
        
        # Otherwise return first available non-subtask type
        if available_types:
            _issue_type_cache = available_types[0]
            return available_types[0]
            
        return None
    except Exception:
        return "Task"  # Fallback


def _priority_exists(priority_name: str) -> bool:
    """Check if a priority exists in this Jira instance."""
    try:
        response = requests.get(
            f"{BASE_URL}/priority",
            auth=AUTH,
            headers=HEADERS,
            timeout=10,
        )
        response.raise_for_status()
        priorities = response.json()
        return any(p["name"] == priority_name for p in priorities)
    except Exception:
        return False


def create_issue(
    summary: str,
    description: str,
    priority: str = "medium",
    labels: list = None,
    assignee_email: str = None,
    issue_type: str = None,
) -> dict:
    if not is_configured():
        return {"status": "skipped", "reason": "Jira not configured"}

    # Get valid issue type for this project
    valid_issue_type = issue_type or _get_default_issue_type()
    
    if not valid_issue_type:
        return {"status": "failed", "error": "Could not determine valid issue type for project"}

    payload = {
        "fields": {
            "project": {"key": JIRA_PROJECT_KEY},
            "summary": summary,
            "description": {
                "type": "doc",
                "version": 1,
                "content": [{
                    "type": "paragraph",
                    "content": [{"type": "text", "text": description}]
                }]
            },
            "issuetype": {"name": valid_issue_type},
        }
    }

    # Only add priority if valid
    jira_priority = PRIORITY_MAP.get(priority, "Medium")
    if _priority_exists(jira_priority):
        payload["fields"]["priority"] = {"name": jira_priority}

    if labels:
        payload["fields"]["labels"] = labels

    if assignee_email:
        account_id = _find_user(assignee_email)
        if account_id:
            payload["fields"]["assignee"] = {"accountId": account_id}

    try:
        response = requests.post(
            f"{BASE_URL}/issue",
            json=payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()

        return {
            "status": "created",
            "jira_key": data["key"],
            "jira_id": data["id"],
            "jira_url": f"https://{JIRA_DOMAIN}/browse/{data['key']}",
            "summary": summary,
            "issue_type": valid_issue_type,
        }
    except requests.exceptions.HTTPError as e:
        error_detail = ""
        try:
            error_detail = e.response.json()
        except Exception:
            error_detail = e.response.text
        return {"status": "failed", "error": str(error_detail)}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def update_issue(issue_key: str, updates: dict) -> dict:
    if not is_configured():
        return {"status": "skipped", "reason": "Jira not configured"}

    fields = {}

    if "status" in updates:
        transition_result = _transition_issue(issue_key, updates["status"])
        if transition_result.get("status") != "success":
            return transition_result

    if "priority" in updates:
        jira_priority = PRIORITY_MAP.get(updates["priority"], "Medium")
        if _priority_exists(jira_priority):
            fields["priority"] = {"name": jira_priority}

    if "summary" in updates:
        fields["summary"] = updates["summary"]

    if "labels" in updates:
        fields["labels"] = updates["labels"]

    if fields:
        try:
            response = requests.put(
                f"{BASE_URL}/issue/{issue_key}",
                json={"fields": fields},
                auth=AUTH,
                headers=HEADERS,
                timeout=10,
            )
            response.raise_for_status()
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    return {
        "status": "updated",
        "jira_key": issue_key,
        "changes": updates,
        "jira_url": f"https://{JIRA_DOMAIN}/browse/{issue_key}",
    }


def add_comment(issue_key: str, comment: str) -> dict:
    if not is_configured():
        return {"status": "skipped", "reason": "Jira not configured"}

    payload = {
        "body": {
            "type": "doc",
            "version": 1,
            "content": [{
                "type": "paragraph",
                "content": [{"type": "text", "text": comment}]
            }]
        }
    }

    try:
        response = requests.post(
            f"{BASE_URL}/issue/{issue_key}/comment",
            json=payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=10,
        )
        response.raise_for_status()
        return {"status": "commented", "jira_key": issue_key}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


def get_issue(issue_key: str) -> dict:
    if not is_configured():
        return {"status": "skipped", "reason": "Jira not configured"}

    try:
        response = requests.get(
            f"{BASE_URL}/issue/{issue_key}",
            auth=AUTH,
            headers=HEADERS,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        fields = data["fields"]

        return {
            "status": "found",
            "jira_key": data["key"],
            "summary": fields.get("summary"),
            "description": _extract_text(fields.get("description")),
            "priority": fields.get("priority", {}).get("name"),
            "issue_status": fields.get("status", {}).get("name"),
            "assignee": fields.get("assignee", {}).get("displayName") if fields.get("assignee") else None,
            "labels": fields.get("labels", []),
            "jira_url": f"https://{JIRA_DOMAIN}/browse/{data['key']}",
        }
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return {"status": "not_found", "jira_key": issue_key}
        return {"status": "failed", "error": str(e)}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def search_issues(query: str, max_results: int = 5) -> dict:
    if not is_configured():
        return {"status": "skipped", "reason": "Jira not configured"}

    jql = f'project = {JIRA_PROJECT_KEY} AND text ~ "{query}" ORDER BY created DESC'

    try:
        response = requests.get(
            f"{BASE_URL}/search",
            params={"jql": jql, "maxResults": max_results},
            auth=AUTH,
            headers=HEADERS,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()

        issues = []
        for issue in data.get("issues", []):
            fields = issue["fields"]
            issues.append({
                "jira_key": issue["key"],
                "summary": fields.get("summary"),
                "priority": fields.get("priority", {}).get("name"),
                "status": fields.get("status", {}).get("name"),
                "assignee": fields.get("assignee", {}).get("displayName") if fields.get("assignee") else None,
            })

        return {"status": "success", "total": data.get("total", 0), "issues": issues}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def _find_user(email: str) -> str | None:
    try:
        response = requests.get(
            f"{BASE_URL}/user/search",
            params={"query": email},
            auth=AUTH,
            headers=HEADERS,
            timeout=10,
        )
        response.raise_for_status()
        users = response.json()
        if users:
            return users[0]["accountId"]
    except Exception:
        pass
    return None


def _transition_issue(issue_key: str, target_status: str) -> dict:
    status_map = {
        "in_progress": "In Progress",
        "resolved": "Done",
        "closed": "Done",
        "open": "To Do",
    }
    target = status_map.get(target_status, target_status)

    try:
        response = requests.get(
            f"{BASE_URL}/issue/{issue_key}/transitions",
            auth=AUTH,
            headers=HEADERS,
            timeout=10,
        )
        response.raise_for_status()
        transitions = response.json().get("transitions", [])

        transition_id = None
        for t in transitions:
            if t["name"].lower() == target.lower() or t["to"]["name"].lower() == target.lower():
                transition_id = t["id"]
                break

        if not transition_id:
            available = [t["name"] for t in transitions]
            return {"status": "failed", "error": f"No transition to '{target}'. Available: {available}"}

        response = requests.post(
            f"{BASE_URL}/issue/{issue_key}/transitions",
            json={"transition": {"id": transition_id}},
            auth=AUTH,
            headers=HEADERS,
            timeout=10,
        )
        response.raise_for_status()
        return {"status": "success"}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


def _extract_text(description: dict | None) -> str:
    if not description:
        return ""
    try:
        texts = []
        for block in description.get("content", []):
            for item in block.get("content", []):
                if item.get("type") == "text":
                    texts.append(item["text"])
        return " ".join(texts)
    except Exception:
        return ""