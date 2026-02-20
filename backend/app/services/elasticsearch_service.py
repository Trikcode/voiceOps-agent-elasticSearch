from app.config import es_client


def search_similar_tickets(description: str, size: int = 5) -> list:
    if not description:
        return []

    result = es_client.search(
        index="voiceops-tickets",
        body={
            "query": {
                "multi_match": {
                    "query": description,
                    "fields": ["summary^2", "description", "labels"],
                    "fuzziness": "AUTO"
                }
            },
            "size": size
        }
    )

    tickets = []
    for hit in result["hits"]["hits"]:
        ticket = hit["_source"]
        ticket["relevance_score"] = hit["_score"]
        tickets.append(ticket)
    return tickets


def find_ticket_by_id(ticket_id: str) -> dict | None:
    result = es_client.search(
        index="voiceops-tickets",
        body={"query": {"term": {"ticket_id": ticket_id}}, "size": 1}
    )
    if result["hits"]["hits"]:
        return result["hits"]["hits"][0]["_source"]
    return None


def search_past_commands(transcript: str, size: int = 3) -> list:
    result = es_client.search(
        index="voiceops-commands",
        body={"query": {"match": {"raw_transcript": transcript}}, "size": size}
    )
    return [hit["_source"] for hit in result["hits"]["hits"]]


def search_past_actions(action_type: str, size: int = 3) -> list:
    if not action_type:
        return []
    result = es_client.search(
        index="voiceops-actions",
        body={"query": {"match": {"action_type": action_type}}, "size": size}
    )
    return [hit["_source"] for hit in result["hits"]["hits"]]


def get_ticket_stats() -> dict:
    try:
        result = es_client.search(
            index="voiceops-tickets",
            body={
                "size": 0,
                "aggs": {
                    "by_project": {"terms": {"field": "project"}},
                    "by_priority": {"terms": {"field": "priority"}},
                    "by_status": {"terms": {"field": "status"}}
                }
            }
        )
        aggs = result["aggregations"]
        return {
            "by_project": {b["key"]: b["doc_count"] for b in aggs["by_project"]["buckets"]},
            "by_priority": {b["key"]: b["doc_count"] for b in aggs["by_priority"]["buckets"]},
            "by_status": {b["key"]: b["doc_count"] for b in aggs["by_status"]["buckets"]},
        }
    except Exception:
        return {}


def get_all_tickets(size: int = 50) -> list:
    result = es_client.search(
        index="voiceops-tickets",
        body={
            "query": {"match_all": {}},
            "sort": [{"created_at": {"order": "desc"}}],
            "size": size
        }
    )
    return [hit["_source"] for hit in result["hits"]["hits"]]


def get_all_actions(size: int = 50) -> list:
    result = es_client.search(
        index="voiceops-actions",
        body={
            "query": {"match_all": {}},
            "sort": [{"timestamp": {"order": "desc"}}],
            "size": size
        }
    )
    return [hit["_source"] for hit in result["hits"]["hits"]]


def get_action_stats() -> dict:
    try:
        result = es_client.search(
            index="voiceops-actions",
            body={
                "size": 0,
                "aggs": {
                    "by_type": {"terms": {"field": "action_type"}},
                    "by_tool": {"terms": {"field": "tool_used"}},
                    "avg_duration": {"avg": {"field": "duration_ms"}}
                }
            }
        )
        aggs = result["aggregations"]
        return {
            "total": result["hits"]["total"]["value"],
            "by_type": {b["key"]: b["doc_count"] for b in aggs["by_type"]["buckets"]},
            "by_tool": {b["key"]: b["doc_count"] for b in aggs["by_tool"]["buckets"]},
            "avg_duration_ms": aggs["avg_duration"].get("value", 0),
        }
    except Exception:
        return {}


def index_document(index: str, document: dict):
    es_client.index(index=index, document=document)
    es_client.indices.refresh(index=index)


def update_document(index: str, ticket_id: str, updates: dict) -> dict:
    result = es_client.search(
        index=index,
        body={"query": {"term": {"ticket_id": ticket_id}}, "size": 1}
    )
    if not result["hits"]["hits"]:
        return {"error": f"Document {ticket_id} not found"}

    doc_id = result["hits"]["hits"][0]["_id"]
    old_data = result["hits"]["hits"][0]["_source"]

    es_client.update(index=index, id=doc_id, body={"doc": updates})
    es_client.indices.refresh(index=index)

    return {
        "ticket_id": ticket_id,
        "action": "updated",
        "changes": updates,
        "previous": {k: old_data.get(k) for k in updates.keys()}
    }


def get_index_counts() -> dict:
    return {
        "voiceops-tickets": es_client.count(index="voiceops-tickets")["count"],
        "voiceops-commands": es_client.count(index="voiceops-commands")["count"],
        "voiceops-actions": es_client.count(index="voiceops-actions")["count"],
    }


def get_cluster_info() -> dict:
    return es_client.info()