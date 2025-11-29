# app/schemas/user.py

from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, ConfigDict, Field


AllowedRole = Literal["user", "lawyer", "admin"]


class LawyerSignupProfile(BaseModel):
    city: str
    specialization: str
    experience_years: int = Field(ge=0)
    hourly_rate: float = Field(ge=0)


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    role: AllowedRole
    lawyer_profile: Optional[LawyerSignupProfile] = None


class UserLogin(BaseModel):
    email: EmailStr
    role: AllowedRole


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: AllowedRole

    model_config = ConfigDict(from_attributes=True)
