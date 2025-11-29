# app/schemas/review.py

from pydantic import BaseModel, ConfigDict


class ReviewCreate(BaseModel):
    booking_id: int
    rating: int  # 1–5
    comment: str | None = None


class ReviewOut(BaseModel):
    id: int
    booking_id: int
    user_id: int
    lawyer_id: int
    rating: int
    comment: str | None = None

    model_config = ConfigDict(from_attributes=True)
