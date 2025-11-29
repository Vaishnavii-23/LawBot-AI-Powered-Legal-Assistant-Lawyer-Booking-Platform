# app/schemas/lawyer.py

from pydantic import BaseModel, ConfigDict


class LawyerProfileCreate(BaseModel):
    user_id: int
    city: str
    specialization: str
    experience_years: int
    hourly_rate: float
    bio: str | None = None


class LawyerProfileOut(BaseModel):
    id: int
    user_id: int
    city: str
    specialization: str
    experience_years: int
    hourly_rate: float
    bio: str | None = None

    model_config = ConfigDict(from_attributes=True)


class LawyerProfileWithStats(LawyerProfileOut):
    full_name: str | None = None
    average_rating: float | None = None
    total_reviews: int = 0
