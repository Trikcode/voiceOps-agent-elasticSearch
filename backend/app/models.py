from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class VoiceCommand(BaseModel):
    transcript: str


class ConfirmAction(BaseModel):
    command_id: str
    approved: bool


class TicketUpdate(BaseModel):
    ticket_id: str
    updates: Dict[str, Any]


class PipelineResult(BaseModel):
    success: bool
    command_id: str
    transcript: str
    duration_ms: int
    status: str
    pipeline: Dict[str, Any]
    clarification: Optional[str] = None
    execution_results: Optional[List[Dict]] = None