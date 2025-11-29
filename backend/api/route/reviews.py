# app/api/routes/reviews.py

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session

from app.schemas.review import ReviewCreate, ReviewOut
from app.db.database import get_db
from app.db import models

router = APIRouter(prefix="/reviews", tags=["reviews"])


RATING_MIN = 1
RATING_MAX = 5


@router.post("", response_model=ReviewOut)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
):
    # 1) Booking must exist
    booking = (
        db.query(models.Booking)
        .filter(models.Booking.id == payload.booking_id)
        .first()
    )
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    # 2) Get user + lawyer from booking
    user_id = booking.user_id
    lawyer_id = booking.lawyer_id

    if not (RATING_MIN <= payload.rating <= RATING_MAX):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")

    review = models.Review(
        booking_id=payload.booking_id,
        user_id=user_id,
        lawyer_id=lawyer_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return ReviewOut.model_validate(review)


@router.get("/lawyer/{lawyer_id}", response_model=List[ReviewOut])
def list_lawyer_reviews(lawyer_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(models.Review)
        .filter(models.Review.lawyer_id == lawyer_id)
        .all()
    )
    return [ReviewOut.model_validate(r) for r in reviews]


@router.get("/user/{user_id}", response_model=List[ReviewOut])
def list_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(models.Review)
        .filter(models.Review.user_id == user_id)
        .order_by(models.Review.id.desc())
        .all()
    )
    return [ReviewOut.model_validate(r) for r in reviews]
