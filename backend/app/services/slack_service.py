import requests
from datetime import datetime, timezone
from app.config import SLACK_WEBHOOK_URL


def send_notification(channel: str, message: str) -> dict:
    if not SLACK_WEBHOOK_URL:
        return {
            "status": "skipped",
            "reason": "No Slack webhook configured",
            "channel": channel,
            "message": message
        }

    payload = {
        "text": "🎙️ VoiceOps Agent Alert",
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "🎙️ VoiceOps Agent"}
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": message}
            },
            {
                "type": "context",
                "elements": [{
                    "type": "mrkdwn",
                    "text": f"📍 #{channel} | ⏰ {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}"
                }]
            }
        ]
    }

    try:
        response = requests.post(SLACK_WEBHOOK_URL, json=payload, timeout=5)
        return {
            "status": "sent" if response.status_code == 200 else "failed",
            "channel": channel,
            "message": message,
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}