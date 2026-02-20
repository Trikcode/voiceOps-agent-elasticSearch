"""
Agent Pipeline: Orchestrates the full command processing flow.
Voice → Intent → Context Search → Reasoning → Plan → Execute → Log
"""

import uuid
from datetime import datetime, timezone
from app.services import elasticsearch_service as es_service
from app.services import llm_service
from app.services import slack_service
from app.services import action_service

# Stores pending actions awaiting user confirmation
pending_actions: dict = {}


async def process_command(transcript: str) -> dict:
    command_id = f"cmd-{uuid.uuid4().hex[:8]}"
    start_time = datetime.now(timezone.utc)

    # Step 1: Extract intent
    intent_data = llm_service.extract_intent(transcript)

    # Step 2: Search context
    context = _gather_context(intent_data, transcript)

    # Step 3: Create action plan
    plan = llm_service.create_action_plan(transcript, intent_data, context)

    duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

    # If agent needs clarification, return early
    if plan.get("clarification_needed"):
        return {
            "success": True,
            "command_id": command_id,
            "transcript": transcript,
            "duration_ms": duration_ms,
            "status": "needs_clarification",
            "clarification": plan["clarification_needed"],
            "pipeline": _build_pipeline_response(intent_data, context, plan)
        }

    # Store for confirmation
    pending_actions[command_id] = {
        "transcript": transcript,
        "intent_data": intent_data,
        "context": context,
        "plan": plan,
        "start_time": start_time,
    }

    return {
        "success": True,
        "command_id": command_id,
        "transcript": transcript,
        "duration_ms": duration_ms,
        "status": "pending_confirmation",
        "pipeline": _build_pipeline_response(intent_data, context, plan)
    }


async def confirm_action(command_id: str, approved: bool) -> dict:
    pending = pending_actions.get(command_id)
    if not pending:
        return {"success": False, "error": "No pending action found"}

    if not approved:
        action_service.log_action(
            command_id, "rejected", "user_review", True,
            "User rejected the proposed plan.", "No actions executed.", 0
        )
        del pending_actions[command_id]
        return {"success": True, "command_id": command_id, "status": "rejected"}

    # Execute the plan
    start_time = datetime.now(timezone.utc)
    results = _execute_plan(command_id, pending["plan"], start_time)

    action_service.log_command(
        command_id, pending["transcript"], pending["intent_data"], "executed"
    )

    del pending_actions[command_id]

    return {
        "success": True,
        "command_id": command_id,
        "status": "executed",
        "execution_results": results,
        "total_actions": len(results),
        "successful_actions": sum(1 for r in results if r["status"] == "success"),
    }


async def quick_execute(transcript: str) -> dict:
    command_id = f"cmd-{uuid.uuid4().hex[:8]}"
    start_time = datetime.now(timezone.utc)

    intent_data = llm_service.extract_intent(transcript)
    context = _gather_context(intent_data, transcript)
    plan = llm_service.create_action_plan(transcript, intent_data, context)

    if plan.get("clarification_needed"):
        return {
            "success": True,
            "command_id": command_id,
            "status": "needs_clarification",
            "clarification": plan["clarification_needed"],
            "pipeline": _build_pipeline_response(intent_data, context, plan)
        }

    results = _execute_plan(command_id, plan, start_time)
    action_service.log_command(command_id, transcript, intent_data, "executed")

    duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

    return {
        "success": True,
        "command_id": command_id,
        "transcript": transcript,
        "duration_ms": duration_ms,
        "status": "executed",
        "pipeline": _build_pipeline_response(intent_data, context, plan),
        "execution_results": results,
    }


def _gather_context(intent_data: dict, transcript: str) -> dict:
    entities = intent_data.get("entities", {})
    description = entities.get("description", "")
    ticket_id = entities.get("ticket_id")

    context = {
        "similar_tickets": es_service.search_similar_tickets(description),
        "target_ticket": es_service.find_ticket_by_id(ticket_id) if ticket_id else None,
        "past_commands": es_service.search_past_commands(transcript),
        "past_actions": es_service.search_past_actions(intent_data.get("intent", "")),
        "stats": es_service.get_ticket_stats(),
    }
    return context


def _build_pipeline_response(intent_data: dict, context: dict, plan: dict) -> dict:
    return {
        "step1_intent": intent_data,
        "step2_context": {
            "similar_tickets": context["similar_tickets"],
            "target_ticket": context.get("target_ticket"),
            "past_commands_found": len(context["past_commands"]),
            "past_actions_found": len(context["past_actions"]),
            "stats": context.get("stats", {}),
        },
        "step3_plan": plan,
    }


def _execute_plan(command_id: str, plan: dict, start_time: datetime) -> list:
    results = []

    for action in plan.get("actions", []):
        action_type = action.get("type")
        params = action.get("params", {})

        try:
            if action_type == "create_ticket":
                result = action_service.create_ticket(params)
            elif action_type in ("update_ticket", "close_ticket"):
                if action_type == "close_ticket":
                    params.setdefault("updates", {})["status"] = "resolved"
                result = action_service.update_ticket(params)
            elif action_type == "notify_slack":
                result = slack_service.send_notification(
                    params.get("channel", "general"),
                    params.get("message", "")
                )
            else:
                result = {"error": f"Unknown action: {action_type}"}

            duration = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
            action_service.log_action(
                command_id, action_type, f"voiceops_{action_type}",
                "error" not in result, plan.get("reasoning", ""),
                action.get("description", ""), duration, result
            )

            results.append({
                "step": action.get("step"),
                "type": action_type,
                "description": action.get("description"),
                "status": "success" if "error" not in result else "failed",
                "result": result,
            })

        except Exception as e:
            results.append({
                "step": action.get("step"),
                "type": action_type,
                "status": "error",
                "error": str(e),
            })

    return results