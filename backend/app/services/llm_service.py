import json
from app.config import llm_client, LLM_MODEL

INTENT_SYSTEM_PROMPT = """Extract intent and entities from this voice command.

Valid intents: create_ticket, update_ticket, close_ticket, find_similar, notify_slack, query_status, run_workflow

Return ONLY valid JSON:
{
    "intent": "one of the intents above",
    "entities": {
        "project": "string or null",
        "description": "string describing the issue",
        "priority": "critical/high/medium/low or null",
        "assignee": "string or null",
        "channel": "slack channel name or null",
        "ticket_id": "existing ticket ID if mentioned, or null",
        "new_status": "open/in_progress/resolved/closed or null"
    }
}"""

PLANNING_SYSTEM_PROMPT = """You are VoiceOps Agent. Create an action plan that will be executed for real.

Return ONLY valid JSON:
{
    "reasoning": "Why you chose these actions. Reference ticket IDs from search results.",
    "actions": [
        {
            "step": 1,
            "type": "create_ticket | update_ticket | notify_slack",
            "description": "What this step does",
            "params": {}
        }
    ],
    "explanation": "Human-friendly summary of the entire plan",
    "confidence": "high/medium/low",
    "duplicate_warning": "Warning if similar ticket exists, or null",
    "clarification_needed": "Question if ambiguous, or null"
}

For create_ticket params: project, summary, description, priority, assignee, team, labels
For update_ticket params: ticket_id, updates (object with fields to change)
For notify_slack params: channel, message

Known teams:
- AUTH-BACKEND: login, auth, OAuth, password. People: sarah.chen, james.wu
- CORE-PLATFORM: infrastructure, database, platform. People: maria.garcia
- FRONTEND: UI, browser, dashboard. People: alex.kim

Always reference evidence from search results. Multiple actions encouraged when appropriate."""


def parse_llm_json(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    return json.loads(raw)


def extract_intent(transcript: str) -> dict:
    response = llm_client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": INTENT_SYSTEM_PROMPT},
            {"role": "user", "content": transcript}
        ],
        temperature=0,
    )
    return parse_llm_json(response.choices[0].message.content)


def create_action_plan(transcript: str, intent_data: dict, context: dict) -> dict:
    context_prompt = f"""
USER COMMAND: "{transcript}"
INTENT: {json.dumps(intent_data, indent=2)}
SIMILAR TICKETS: {json.dumps(context.get('similar_tickets', []), indent=2)}
TARGET TICKET: {json.dumps(context.get('target_ticket'), indent=2)}
PAST COMMANDS: {json.dumps(context.get('past_commands', []), indent=2)}
PAST ACTIONS: {json.dumps(context.get('past_actions', []), indent=2)}
STATS: {json.dumps(context.get('stats', {}), indent=2)}
"""

    response = llm_client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": PLANNING_SYSTEM_PROMPT},
            {"role": "user", "content": context_prompt}
        ],
        temperature=0,
    )
    return parse_llm_json(response.choices[0].message.content)