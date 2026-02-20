from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models import VoiceCommand, ConfirmAction
from app.pipeline import agent
from app.services import speech_service

router = APIRouter(prefix="/api", tags=["commands"])


@router.post("/process-command")
async def process_command(command: VoiceCommand):
    try:
        return await agent.process_command(command.transcript)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/confirm-action")
async def confirm_action(confirm: ConfirmAction):
    try:
        result = await agent.confirm_action(confirm.command_id, confirm.approved)
        if not result.get("success") and result.get("error"):
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quick-execute")
async def quick_execute(command: VoiceCommand):
    try:
        return await agent.quick_execute(command.transcript)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()
        transcript = await speech_service.transcribe_audio(audio_bytes, audio.filename or "audio.webm")
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")