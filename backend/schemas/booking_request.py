# app/schemas/booking_request.py

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class BookingRequestCreate(BaseModel):
    user_id: int
    lawyer_id: int
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    notes: Optional[str] = None


class BookingRequestStatusUpdate(BaseModel):
    status: str


class UserSummary(BaseModel):
    id: int
    full_name: str
    email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class LawyerSummary(BaseModel):
    id: int
    user_id: int
    city: Optional[str] = None
    specialization: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class BookingRequestOut(BaseModel):
    id: int
    user_id: int
    lawyer_id: int
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    notes: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    user: Optional[UserSummary] = None
    lawyer: Optional[LawyerSummary] = None
    booking_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
