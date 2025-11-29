# app/schemas/chat.py

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ChatMessageOut(BaseModel):
    id: int
    user_id: Optional[int]
    session_id: Optional[int]
    role: str
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SourceChunk(BaseModel):
    pdf_path: str
    chunk_id: int
    text: str


class SuggestedLawyer(BaseModel):
    lawyer_id: int
    full_name: str
    city: str
    specialization: str
    experience_years: int
    hourly_rate: float
    average_rating: Optional[float] = None
    total_reviews: int = 0


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]
    detected_category: str
    session_id: Optional[int] = None
    suggested_lawyers: List[SuggestedLawyer] = Field(default_factory=list)


class ChatSessionSummary(BaseModel):
    id: int
    title: Optional[str]
    created_at: datetime
    last_activity_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSessionDetail(BaseModel):
    session: ChatSessionSummary
    messages: List[ChatMessageOut]

    model_config = ConfigDict(from_attributes=True)


class UploadedDocumentOut(BaseModel):
    id: int
    user_id: Optional[int]
    original_filename: str
    stored_path: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VoiceToTextResponse(BaseModel):
    transcript: str
    duration_ms: Optional[int] = None


class TextToVoiceRequest(BaseModel):
    text: str


class TextToVoiceResponse(BaseModel):
    message: str
    text_echo: str
    audio_base64: str
    content_type: str
