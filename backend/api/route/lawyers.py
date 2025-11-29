# app/api/routes/lawyers.py  (only the list endpoint part)

from typing import List, Optional, cast

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.schemas.lawyer import LawyerProfileCreate, LawyerProfileOut, LawyerProfileWithStats

router = APIRouter(prefix="/lawyers", tags=["lawyers"])


@router.post("/profile", response_model=LawyerProfileOut)
def create_lawyer_profile(
    profile_in: LawyerProfileCreate,
    db: Session = Depends(get_db),
):
    # ... your existing create logic ...
    user = db.query(models.User).filter(models.User.id == profile_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_role = cast(str, user.role)
    if user_role != "lawyer":
        raise HTTPException(status_code=400, detail="User is not a lawyer")

    profile = (
        db.query(models.LawyerProfile)
        .filter(models.LawyerProfile.user_id == profile_in.user_id)
        .first()
    )

    payload = profile_in.dict()

    if profile is None:
        profile = models.LawyerProfile(**payload)
        db.add(profile)
    else:
        for field, value in payload.items():
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return LawyerProfileOut.model_validate(profile)


# NOTE: Frontend expects full_name in the response payload, so augment schema on the fly.


@router.get("", response_model=List[LawyerProfileWithStats])
def list_lawyers(
    city: Optional[str] = Query(None, description="Filter by city"),
    specialization: Optional[str] = Query(None, description="Filter by specialization/category"),
    min_experience: Optional[int] = Query(None, description="Minimum years of experience"),
    max_hourly_rate: Optional[float] = Query(None, description="Maximum hourly rate"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum average rating"),
    user_id: Optional[int] = Query(None, description="Restrict to lawyer owned by this user"),
    page: int = Query(1, ge=1, description="Results page number"),
    page_size: int = Query(10, ge=1, description="Results per page (max 50)"),
    db: Session = Depends(get_db),
):
    """
    List lawyers with optional filters:
    - city
    - specialization (e.g. 'divorce', 'property')
    - min_experience
    - max_hourly_rate
    """
    normalized_page_size = min(page_size, 50)
    offset = (page - 1) * normalized_page_size

    ratings_subq = (
        db.query(
            models.Review.lawyer_id.label("lawyer_id"),
            func.avg(models.Review.rating).label("avg_rating"),
            func.count(models.Review.id).label("review_count"),
        )
        .group_by(models.Review.lawyer_id)
        .subquery()
    )

    query = (
        db.query(
            models.LawyerProfile,
            models.User,
            func.coalesce(ratings_subq.c.avg_rating, 0).label("avg_rating"),
            func.coalesce(ratings_subq.c.review_count, 0).label("review_count"),
        )
        .join(models.User, models.User.id == models.LawyerProfile.user_id)
        .outerjoin(ratings_subq, ratings_subq.c.lawyer_id == models.LawyerProfile.id)
    )

    if city:
        query = query.filter(models.LawyerProfile.city.ilike(f"%{city}%"))
    if specialization:
        query = query.filter(models.LawyerProfile.specialization.ilike(f"%{specialization}%"))
    if min_experience is not None:
        query = query.filter(models.LawyerProfile.experience_years >= min_experience)
    if max_hourly_rate is not None:
        query = query.filter(models.LawyerProfile.hourly_rate <= max_hourly_rate)
    if min_rating is not None:
        query = query.filter(func.coalesce(ratings_subq.c.avg_rating, 0) >= min_rating)
    if user_id is not None:
        query = query.filter(models.LawyerProfile.user_id == user_id)

    query = query.order_by(models.LawyerProfile.experience_years.desc())

    results = query.offset(offset).limit(normalized_page_size).all()

    response: List[LawyerProfileWithStats] = []
    for profile, user, avg_rating, review_count in results:
        base_data = LawyerProfileOut.model_validate(profile).model_dump()
        response.append(
            LawyerProfileWithStats(
                **base_data,
                full_name=user.full_name,
                average_rating=float(avg_rating) if review_count else None,
                total_reviews=int(review_count),
            )
        )

    return response


@router.get("/{lawyer_id}", response_model=LawyerProfileWithStats)
def get_lawyer(lawyer_id: int, db: Session = Depends(get_db)):
    """Return a single lawyer profile with the same shape expected by the frontend list view."""

    result = (
        db.query(
            models.LawyerProfile,
            models.User,
            func.avg(models.Review.rating).label("avg_rating"),
            func.count(models.Review.id).label("review_count"),
        )
        .join(models.User, models.User.id == models.LawyerProfile.user_id)
        .outerjoin(models.Review, models.Review.lawyer_id == models.LawyerProfile.id)
        .filter(models.LawyerProfile.id == lawyer_id)
        .group_by(models.LawyerProfile.id, models.User.id)
        .first()
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Lawyer not found")

    profile, user, avg_rating, review_count = result
    base_payload = LawyerProfileOut.model_validate(profile).model_dump()

    average_rating = float(avg_rating) if avg_rating is not None else None
    total_reviews = int(review_count or 0)

    return LawyerProfileWithStats(
        **base_payload,
        full_name=user.full_name,
        average_rating=average_rating if total_reviews else None,
        total_reviews=total_reviews,
    )
