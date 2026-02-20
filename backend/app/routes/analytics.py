from fastapi import APIRouter, Query
from app.config import es_client
from app.services import elasticsearch_service as es_service
from app.services import metrics_service
from app.services import jira_service
from app.config import SLACK_WEBHOOK_URL

router = APIRouter(prefix="/api", tags=["analytics"])


@router.get("/analytics")
async def get_analytics():
    return {
        "tickets": {
            "total": es_service.get_index_counts()["voiceops-tickets"],
            **es_service.get_ticket_stats(),
        },
        "actions": es_service.get_action_stats(),
    }


@router.get("/health")
async def health_check():
    try:
        info = es_service.get_cluster_info()
        return {
            "status": "healthy",
            "elasticsearch": "connected",
            "cluster_name": info.get("cluster_name", "unknown"),
            "slack_configured": bool(SLACK_WEBHOOK_URL),
            "jira_configured": jira_service.is_configured(),
            "indices": es_service.get_index_counts(),
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@router.get("/impact")
async def get_impact_metrics():
    """
    Get impact metrics showing time saved and efficiency gains
    """
    return metrics_service.get_impact_summary()

@router.get("/agent-info")
async def get_agent_info():
    """
    Show Agent Builder configuration
    """
    return {
        "agent_name": "VoiceOps Agent",
        "agent_id": "voiceops-agent",
        "description": "Context-driven voice agent powered by Elasticsearch Agent Builder",
        "tools_used": [
            {
                "name": "platform.core.search",
                "purpose": "Search similar tickets and past commands for context",
            },
            {
                "name": "platform.core.execute_esql", 
                "purpose": "Run ES|QL queries for analytics and reporting",
            },
            {
                "name": "platform.core.get_document_by_id",
                "purpose": "Retrieve specific ticket details",
            },
        ],
        "integrations": {
            "jira": True,
            "slack": True,
            "elasticsearch": True,
        },
        "capabilities": [
            "Voice-to-text transcription",
            "Intent extraction with LLM",
            "Context retrieval from Elasticsearch",
            "Multi-step reasoning and planning",
            "Tool selection and orchestration",
            "Action execution with confirmation",
            "Full audit logging",
            "ES|QL analytics queries",
        ],
    }

# ES|QL ENDPOINTS 

@router.get("/esql/recent-actions")
async def esql_recent_actions(limit: int = Query(default=10, le=100)):
    """
    ES|QL Query: Get recent agent actions with timing analysis
    """
    query = f"""
        FROM voiceops-actions
        | SORT timestamp DESC
        | LIMIT {limit}
        | KEEP timestamp, action_type, tool_used, success, duration_ms, reasoning
    """
    
    try:
        result = es_client.esql.query(query=query)
        return {
            "query": query,
            "columns": result.get("columns", []),
            "values": result.get("values", []),
            "total": len(result.get("values", [])),
        }
    except Exception as e:
        return {"error": str(e), "query": query}


@router.get("/esql/action-stats")
async def esql_action_stats():
    """
    ES|QL Query: Aggregate action statistics
    """
    query = """
        FROM voiceops-actions
        | STATS 
            total_actions = COUNT(*),
            avg_duration = AVG(duration_ms),
            max_duration = MAX(duration_ms),
            success_count = COUNT(success == true)
        | EVAL success_rate = ROUND(success_count * 100.0 / total_actions, 2)
    """
    
    try:
        result = es_client.esql.query(query=query)
        return {
            "query": query,
            "columns": result.get("columns", []),
            "values": result.get("values", []),
        }
    except Exception as e:
        return {"error": str(e), "query": query}


@router.get("/esql/tickets-by-priority")
async def esql_tickets_by_priority():
    """
    ES|QL Query: Ticket distribution by priority
    """
    query = """
        FROM voiceops-tickets
        | STATS count = COUNT(*) BY priority
        | SORT count DESC
    """
    
    try:
        result = es_client.esql.query(query=query)
        return {
            "query": query,
            "columns": result.get("columns", []),
            "values": result.get("values", []),
        }
    except Exception as e:
        return {"error": str(e), "query": query}


@router.get("/esql/slow-actions")
async def esql_slow_actions(threshold_ms: int = Query(default=2000)):
    """
    ES|QL Query: Find actions that took longer than threshold
    """
    query = f"""
        FROM voiceops-actions
        | WHERE duration_ms > {threshold_ms}
        | SORT duration_ms DESC
        | LIMIT 20
        | KEEP timestamp, action_type, tool_used, duration_ms, reasoning
    """
    
    try:
        result = es_client.esql.query(query=query)
        return {
            "query": query,
            "threshold_ms": threshold_ms,
            "columns": result.get("columns", []),
            "values": result.get("values", []),
        }
    except Exception as e:
        return {"error": str(e), "query": query}


@router.get("/esql/daily-summary")
async def esql_daily_summary():
    """
    ES|QL Query: Daily action summary (time-series analysis)
    """
    query = """
        FROM voiceops-actions
        | STATS 
            actions = COUNT(*),
            avg_duration = AVG(duration_ms)
          BY day = DATE_TRUNC(1 day, timestamp)
        | SORT day DESC
        | LIMIT 14
    """
    
    try:
        result = es_client.esql.query(query=query)
        return {
            "query": query,
            "columns": result.get("columns", []),
            "values": result.get("values", []),
        }
    except Exception as e:
        return {"error": str(e), "query": query}

@router.post("/esql/custom")
async def esql_custom_query(query: str):
    """
    Execute a custom ES|QL query (for demo purposes)
    """
    try:
        result = es_client.esql.query(query=query)
        return {
            "query": query,
            "columns": result.get("columns", []),
            "values": result.get("values", []),
        }
    except Exception as e:
        return {"error": str(e), "query": query}