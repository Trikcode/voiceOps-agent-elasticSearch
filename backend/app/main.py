from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import commands, tickets, analytics

app = FastAPI(
    title="VoiceOps Agent API",
    description="Context-driven voice agent powered by Elasticsearch Agent Builder",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(commands.router)
app.include_router(tickets.router)
app.include_router(analytics.router)