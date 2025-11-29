# app/schemas/booking.py

from pydantic import BaseModel, ConfigDict


class BookingCreate(BaseModel):
    user_id: int
    lawyer_id: int  # this is lawyer_profile.id
    date: str       # e.g. "2025-11-30"
    time: str       # e.g. "17:30"
    notes: str | None = None
    booking_request_id: int | None = None


class BookingOut(BaseModel):
    id: int
    user_id: int
    lawyer_id: int
    booking_request_id: int | None = None
    date: str
    time: str
    notes: str | None = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class BookingStatusUpdate(BaseModel):
    status: str
