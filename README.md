# 🎙️ VoiceOps Agent

> Context-driven voice agent that converts spoken commands into verified operational actions, powered by Elasticsearch Agent Builder.

![VoiceOps Demo](./docs/demo.gif)

## 🏆 Elasticsearch Agent Builder Hackathon 2026

VoiceOps Agent is a multi-step AI agent that combines voice recognition, Elasticsearch context retrieval, and tool orchestration to automate real-world operations tasks.

## ✨ Features

- **Voice Commands**: Speak naturally to create tickets, notify teams, and manage workflows
- **Context-Aware**: Searches Elasticsearch for similar tickets and past actions before acting
- **Multi-Step Reasoning**: Plans actions, verifies decisions, and explains reasoning
- **Real Integrations**: Creates actual Jira tickets and sends Slack notifications
- **Full Audit Trail**: Every action logged to Elasticsearch with ES|QL analytics
- **Confirmation Flow**: Review and approve actions before execution

## Tech Stack

- **Frontend**: React + TypeScript + Lucide Icons
- **Backend**: FastAPI + Python
- **Search & Analytics**: Elasticsearch + ES|QL
- **AI**: Groq LLaMA 3.3 70B for reasoning
- **Integrations**: Jira REST API, Slack Webhooks
- **Speech**: Whisper API for transcription

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Elasticsearch Cloud account
- Jira Cloud account (optional)
- Slack workspace (optional)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run
uvicorn app.main:app --reload
```
# VoiceOps-Agent
