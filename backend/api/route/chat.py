# app/api/routes/chat.py

from datetime import datetime
import base64
import logging
import os
import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

try:  # Optional dependency: offline transcription
    import whisper  # type: ignore[import]
    _whisper_import_error: Optional[Exception] = None
except Exception as exc:  # pragma: no cover - environment specific
    whisper = None  # type: ignore[assignment]
    _whisper_import_error = exc

try:  # Optional dependency: offline text to speech
    import pyttsx3  # type: ignore[import]
    _pyttsx3_import_error: Optional[Exception] = None
except Exception as exc:  # pragma: no cover - environment specific
    pyttsx3 = None  # type: ignore[assignment]
    _pyttsx3_import_error = exc

logger = logging.getLogger(__name__)

try:  # Lazy guard: torch/sentence-transformers may be unavailable in lightweight deployments
    from app.chat.rag import get_rag_bot as _rag_bot_factory
    _rag_import_error: Optional[Exception] = None
except Exception as exc:  # pragma: no cover - defensive import guard
    logger.warning("RAG pipeline disabled: %s", exc)
    _rag_bot_factory = None
    _rag_import_error = exc
from app.db import models
from app.db.database import get_db
from app.schemas.chat import (
    ChatMessageOut,
    ChatResponse,
    ChatSessionDetail,
    ChatSessionSummary,
    SourceChunk,
    SuggestedLawyer,
    UploadedDocumentOut,
    VoiceToTextResponse,
    TextToVoiceRequest,
    TextToVoiceResponse,
)

router = APIRouter(prefix="/chat", tags=["chat"])


CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "Family Law": ["divorce", "family", "marriage", "custody", "alimony"],
    "Criminal Law": ["criminal", "bail", "fir", "ipc", "crime"],
    "Property / Rent Law": ["property", "rent", "real estate", "tenant", "lease"],
    "Labour / Employment Law": ["labour", "employment", "termination", "wages", "pf"],
    "Cyber Law": ["cyber", "online", "digital", "it act", "phishing"],
    "Motor Vehicle Law": ["motor", "vehicle", "accident", "mv act", "traffic"],
    "Women's Rights": ["women", "sexual", "harassment", "dowry"],
    "Mental Health Law": ["mental", "health", "disability"],
}


WHISPER_MODEL_NAME = os.getenv("WHISPER_MODEL_NAME", "base")
_whisper_model = None


def _get_whisper_model():
    global _whisper_model
    if whisper is None:
        raise RuntimeError(
            "OpenAI Whisper is not installed. Install it to enable voice transcription."
            + (f" Root cause: {_whisper_import_error}" if _whisper_import_error else "")
        )
    if _whisper_model is None:
        try:
            _whisper_model = whisper.load_model(WHISPER_MODEL_NAME)
        except Exception as exc:  # pragma: no cover - external dependency load
            logger.exception("Failed to load Whisper model", exc_info=exc)
            raise RuntimeError("Unable to load Whisper speech model.") from exc
    return _whisper_model


class _FallbackBot:
    """Lightweight responder used when the RAG stack cannot load."""

    def __init__(self, reason: Optional[Exception] = None):
        self.reason = reason

    def answer(self, message: str):
        lowered = (message or "").lower()
        category = _infer_category(lowered)
        summary = (
            "Our legal research assistant is temporarily offline, so this answer is generated "
            "from a lightweight rule-based helper."
        )
        guidance = (
            " Consider booking a consultation with a specialised lawyer for tailored advice."
            if category != "Other"
            else " Please share more specifics so we can route you to the right expert."
        )
        reply = f"{summary} Based on your message, this appears related to {category}." + guidance
        if self.reason:
            logger.debug("Fallback bot engaged due to: %s", self.reason)
        return reply, [], category


def _resolve_bot() -> Tuple[Optional[object], Optional[Exception]]:
    if _rag_bot_factory is None:
        return None, _rag_import_error
    try:
        return _rag_bot_factory(), None
    except Exception as exc:  # pragma: no cover - runtime guard
        logger.exception("Failed to initialise RAG bot", exc_info=exc)
        return None, exc


# ---------- Request / Response Schemas ----------

class ChatRequest(BaseModel):
    user_id: Optional[int] = None
    session_id: Optional[int] = None
    session_title: Optional[str] = None
    message: str


def _map_category_to_keywords(category: str) -> List[str]:
    return CATEGORY_KEYWORDS.get(category, [])


def _infer_category(message: str) -> str:
    text = message.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            return category
    return "Other"


def _generate_session_title(message: str) -> str:
    preview = (message or "").strip()
    if not preview:
        return "Conversation"
    first_line = preview.splitlines()[0]
    trimmed = first_line[:60]
    return f"{trimmed}..." if len(first_line) > 60 else trimmed


def get_suggested_lawyers(
    db: Session,
    category: str,
    limit: int = 5,
) -> List[SuggestedLawyer]:
    """Return up to `limit` lawyers in our DB whose specialization matches the category keywords."""
    keywords = _map_category_to_keywords(category)
    if not keywords:
        return []

    specialization_filters = [models.LawyerProfile.specialization.ilike(f"%{kw}%") for kw in keywords]

    results = (
        db.query(
            models.LawyerProfile,
            models.User,
            func.avg(models.Review.rating).label("avg_rating"),
            func.count(models.Review.id).label("review_count"),
        )
        .join(models.User, models.LawyerProfile.user_id == models.User.id)
        .outerjoin(models.Review, models.Review.lawyer_id == models.LawyerProfile.id)
        .filter(or_(*specialization_filters))
        .group_by(models.LawyerProfile.id, models.User.id)
        .order_by(func.avg(models.Review.rating).desc())
        .limit(limit)
        .all()
    )

    suggestions: List[SuggestedLawyer] = []
    for profile, user, avg_rating, review_count in results:
        suggestions.append(
            SuggestedLawyer(
                lawyer_id=profile.id,
                full_name=user.full_name,
                city=profile.city,
                specialization=profile.specialization,
                experience_years=profile.experience_years,
                hourly_rate=profile.hourly_rate,
                average_rating=float(avg_rating) if avg_rating is not None else None,
                total_reviews=int(review_count or 0),
            )
        )

    return suggestions


# ---------- Main Chat Endpoint ----------

@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    """Answer user queries, persist messages, and return contextual suggestions."""
    clean_message = (req.message or "").strip()
    if not clean_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    bot, fallback_reason = _resolve_bot()
    try:
        if bot is None:
            bot = _FallbackBot(reason=fallback_reason)
        answer, chunks, detected_category = bot.answer(clean_message)
        detected_category = detected_category or "Other"
        if detected_category == "Other":
            detected_category = _infer_category(clean_message)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # defensive catch to surface unexpected bot failures
        logger.exception("Chat responder failed", exc_info=exc)
        raise HTTPException(status_code=500, detail="Failed to generate a chat response.") from exc

    session: Optional[models.ChatSession] = None
    if req.session_id is not None:
        if req.user_id is None:
            raise HTTPException(status_code=400, detail="session_id requires user_id.")
        session = (
            db.query(models.ChatSession)
            .filter(models.ChatSession.id == req.session_id)
            .first()
        )
        if session is None:
            raise HTTPException(status_code=404, detail="Chat session not found.")
        if session.user_id != req.user_id:
            raise HTTPException(status_code=403, detail="Session does not belong to this user.")
        if req.session_title and not session.title:
            session.title = req.session_title
    elif req.user_id is not None:
        session_title = req.session_title or _generate_session_title(clean_message)
        session = models.ChatSession(user_id=req.user_id, title=session_title)
        db.add(session)
        db.flush()

    if req.user_id is not None:
        user_message = models.ChatMessage(
            user_id=req.user_id,
            role="user",
            message=clean_message,
            session_id=session.id if session else None,
        )
        db.add(user_message)

        assistant_message = models.ChatMessage(
            user_id=req.user_id,
            role="assistant",
            message=answer,
            session_id=session.id if session else None,
        )
        db.add(assistant_message)

        if session is not None:
            session.last_activity_at = datetime.utcnow()

        db.commit()

    sources: List[SourceChunk] = []
    for chunk in chunks or []:
        if not chunk:
            continue
        raw_chunk_id = chunk.get("chunk_id")
        try:
            chunk_id = int(raw_chunk_id)
        except (TypeError, ValueError):
            chunk_id = 0
        sources.append(
            SourceChunk(
                pdf_path=chunk.get("pdf_path", ""),
                chunk_id=chunk_id,
                text=(chunk.get("text") or "")[:400],
            )
        )

    category_for_lookup = detected_category or "Other"
    suggested_lawyers = get_suggested_lawyers(
        db=db,
        category=category_for_lookup,
        limit=5,
    )
    session_id_for_response = session.id if session else req.session_id

    return ChatResponse(
        answer=answer,
        sources=sources,
        detected_category=detected_category,
        session_id=session_id_for_response,
        suggested_lawyers=suggested_lawyers,
    )


# ---------- Chat Sessions & History ----------


@router.get("/sessions/{user_id}", response_model=List[ChatSessionSummary])
def list_chat_sessions(user_id: int, db: Session = Depends(get_db)):
    sessions = (
        db.query(models.ChatSession)
        .filter(models.ChatSession.user_id == user_id)
        .order_by(models.ChatSession.last_activity_at.desc())
        .all()
    )
    return sessions


@router.get("/session/{session_id}", response_model=ChatSessionDetail)
def get_chat_session(session_id: int, db: Session = Depends(get_db)):
    session = (
        db.query(models.ChatSession)
        .filter(models.ChatSession.id == session_id)
        .first()
    )
    if session is None:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session_id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )

    return ChatSessionDetail(session=session, messages=messages)


# ---------- Chat History ----------

@router.get("/history/{user_id}", response_model=List[ChatMessageOut])
def get_chat_history(user_id: int, db: Session = Depends(get_db)):
    """Return previous messages for a user, newest first."""
    msgs = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == user_id)
        .order_by(models.ChatMessage.created_at.desc())
        .limit(50)
        .all()
    )
    return msgs


# ---------- File Upload Support ----------


@router.post("/upload", response_model=UploadedDocumentOut)
async def upload_chat_document(
    user_id: Optional[int] = Form(default=None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required.")

    upload_dir = Path("data/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    safe_name = f"{uuid.uuid4().hex}{Path(file.filename).suffix}"
    stored_path = upload_dir / safe_name

    try:
        data = await file.read()
        with stored_path.open("wb") as buffer:
            buffer.write(data)
    except Exception as exc:  # pragma: no cover - file system errors are environment-specific
        logger.exception("Failed to persist uploaded document", exc_info=exc)
        raise HTTPException(status_code=500, detail="Unable to store uploaded document.") from exc

    document = models.UploadedDocument(
        user_id=user_id,
        original_filename=file.filename,
        stored_path=str(stored_path),
    )
    db.add(document)
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        stored_path.unlink(missing_ok=True)
        logger.exception("Failed to record uploaded document", exc_info=exc)
        raise HTTPException(status_code=500, detail="Failed to record uploaded document.") from exc
    db.refresh(document)

    return UploadedDocumentOut.model_validate(document)


# ---------- Voice Support Stubs ----------


@router.post("/voice-to-text", response_model=VoiceToTextResponse)
async def voice_to_text(audio: UploadFile = File(...)):
    if audio is None or not audio.filename:
        raise HTTPException(status_code=400, detail="An audio file is required.")

    extension = Path(audio.filename).suffix.lower()
    if extension not in {".mp3", ".wav"}:
        extension = ".wav"

    temp_dir = Path(tempfile.mkdtemp(prefix="lawbot-voice-"))
    audio_path = temp_dir / f"input{extension}"

    try:
        data = await audio.read()
        if not data:
            raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")

        with audio_path.open("wb") as buffer:
            buffer.write(data)

        try:
            model = _get_whisper_model()
        except RuntimeError as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

        try:
            result = model.transcribe(str(audio_path), fp16=False)
        except Exception as exc:  # pragma: no cover - external library runtime
            logger.exception("Whisper transcription failed", exc_info=exc)
            raise HTTPException(status_code=500, detail="Unable to transcribe audio.") from exc

        transcript = (result.get("text") or "").strip()
        if not transcript:
            raise HTTPException(status_code=400, detail="No transcription could be produced from the audio file.")

        duration_ms: Optional[int] = None
        segments = result.get("segments") or []
        if segments:
            last_end = segments[-1].get("end")
            if isinstance(last_end, (int, float)):
                duration_ms = int(last_end * 1000)
        elif isinstance(result.get("duration"), (int, float)):
            duration_ms = int(float(result["duration"]) * 1000)

        return VoiceToTextResponse(transcript=transcript, duration_ms=duration_ms)
    finally:
        try:
            if audio_path.exists():
                audio_path.unlink()
        except Exception:  # pragma: no cover - best effort cleanup
            pass
        try:
            temp_dir.rmdir()
        except Exception:  # pragma: no cover - best effort cleanup
            pass


@router.post("/text-to-voice", response_model=TextToVoiceResponse)
def text_to_voice(payload: TextToVoiceRequest):
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required for speech synthesis.")

    temp_dir = Path(tempfile.mkdtemp(prefix="lawbot-tts-"))
    wav_path = temp_dir / "output.wav"
    mp3_path = temp_dir / "output.mp3"

    try:
        if pyttsx3 is None:
            detail = "pyttsx3 (text to speech) library is not installed. Install it to use this endpoint."
            if _pyttsx3_import_error is not None:
                detail += f" Root cause: {_pyttsx3_import_error}"
            raise HTTPException(status_code=500, detail=detail)

        try:
            engine = pyttsx3.init()
        except Exception as exc:  # pragma: no cover - environment specific
            logger.exception("pyttsx3 initialisation failed", exc_info=exc)
            raise HTTPException(status_code=500, detail="Text to speech engine unavailable.") from exc

        engine.save_to_file(text, str(wav_path))
        engine.runAndWait()
        engine.stop()

        if not wav_path.exists():
            raise HTTPException(status_code=500, detail="Failed to synthesise speech audio.")

        ffmpeg_binary = shutil.which("ffmpeg")
        if ffmpeg_binary is None:
            raise HTTPException(status_code=500, detail="FFmpeg is required to generate MP3 output. Please install ffmpeg.")

        try:
            subprocess.run(
                [ffmpeg_binary, "-y", "-loglevel", "error", "-i", str(wav_path), str(mp3_path)],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
        except subprocess.CalledProcessError as exc:  # pragma: no cover - external tool failure
            logger.exception("FFmpeg conversion failed", exc_info=exc)
            raise HTTPException(status_code=500, detail="Audio conversion to MP3 failed.") from exc

        if not mp3_path.exists():
            raise HTTPException(status_code=500, detail="MP3 output file was not created.")

        audio_base64 = base64.b64encode(mp3_path.read_bytes()).decode("utf-8")

        return TextToVoiceResponse(
            message="Text to speech generated successfully.",
            text_echo=text,
            audio_base64=audio_base64,
            content_type="audio/mpeg",
        )
    finally:
        for path in (mp3_path, wav_path):
            try:
                if path.exists():
                    path.unlink()
            except Exception:  # pragma: no cover - best effort cleanup
                pass
        try:
            temp_dir.rmdir()
        except Exception:  # pragma: no cover - best effort cleanup
            pass
