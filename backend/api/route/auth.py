from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import models
from app.db.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    lawyer_profile_data = payload.lawyer_profile
    if payload.role == "lawyer":
        if lawyer_profile_data is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="City, specialization, and experience are required for lawyer signups.",
            )

        city = lawyer_profile_data.city.strip()
        specialization = lawyer_profile_data.specialization.strip()
        experience_years = int(lawyer_profile_data.experience_years)
        hourly_rate = float(lawyer_profile_data.hourly_rate)

        if not city or not specialization:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="City and specialization cannot be empty for lawyer signups.",
            )
        if experience_years < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Experience years cannot be negative.",
            )
        if hourly_rate < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hourly rate cannot be negative.",
            )

    try:
        user = models.User(
            email=payload.email,
            full_name=payload.full_name,
            role=payload.role,
        )
        db.add(user)
        db.flush()

        if payload.role == "lawyer" and lawyer_profile_data is not None:
            profile = models.LawyerProfile(
                user_id=user.id,
                city=city,
                specialization=specialization,
                experience_years=experience_years,
                hourly_rate=hourly_rate,
            )
            db.add(profile)

        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise

    return UserOut.model_validate(user)


@router.post("/login", response_model=UserOut)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(models.User.email == payload.email, models.User.role == payload.role)
        .first()
    )
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    return UserOut.model_validate(user)
