# app/api/routes/booking_requests.py

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db import models
from app.db.database import get_db
from app.schemas.booking_request import (
    BookingRequestCreate,
    BookingRequestOut,
    BookingRequestStatusUpdate,
)

router = APIRouter(prefix="/booking-requests", tags=["booking-requests"])

ALLOWED_REQUEST_STATUSES = {"pending", "accepted", "rejected"}


def _ensure_user_is_citizen(db: Session, user_id: int) -> models.User:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "user": # type: ignore
        raise HTTPException(status_code=400, detail="Only end-users can create requests")
    return user


def _ensure_lawyer_profile(db: Session, lawyer_id: int) -> models.LawyerProfile:
    lawyer_profile = (
        db.query(models.LawyerProfile)
        .options(joinedload(models.LawyerProfile.user))
        .filter(models.LawyerProfile.id == lawyer_id)
        .first()
    )
    if lawyer_profile is None:
        raise HTTPException(status_code=404, detail="Lawyer profile not found")
    return lawyer_profile


@router.post("", response_model=BookingRequestOut)
def create_booking_request(
    payload: BookingRequestCreate,
    db: Session = Depends(get_db),
):
    _ensure_user_is_citizen(db, payload.user_id)
    _ensure_lawyer_profile(db, payload.lawyer_id)

    new_request = models.BookingRequest(
        user_id=payload.user_id,
        lawyer_id=payload.lawyer_id,
        preferred_date=payload.preferred_date,
        preferred_time=payload.preferred_time,
        notes=payload.notes,
        status="pending",
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    hydrated = (
        db.query(models.BookingRequest)
        .options(
            joinedload(models.BookingRequest.user),
            joinedload(models.BookingRequest.lawyer),
            joinedload(models.BookingRequest.booking),
        )
        .filter(models.BookingRequest.id == new_request.id)
        .first()
    )

    return BookingRequestOut.model_validate(hydrated or new_request)


@router.get("/lawyer/{lawyer_id}", response_model=List[BookingRequestOut])
def list_lawyer_requests(lawyer_id: int, db: Session = Depends(get_db)):
    _ensure_lawyer_profile(db, lawyer_id)

    requests = (
        db.query(models.BookingRequest)
        .options(
            joinedload(models.BookingRequest.user),
            joinedload(models.BookingRequest.lawyer),
            joinedload(models.BookingRequest.booking),
        )
        .filter(models.BookingRequest.lawyer_id == lawyer_id)
        .order_by(models.BookingRequest.created_at.desc())
        .all()
    )
    return [BookingRequestOut.model_validate(item) for item in requests]


@router.get("/user/{user_id}", response_model=List[BookingRequestOut])
def list_user_requests(user_id: int, db: Session = Depends(get_db)):
    _ensure_user_is_citizen(db, user_id)

    requests = (
        db.query(models.BookingRequest)
        .options(
            joinedload(models.BookingRequest.user),
            joinedload(models.BookingRequest.lawyer),
            joinedload(models.BookingRequest.booking),
        )
        .filter(models.BookingRequest.user_id == user_id)
        .order_by(models.BookingRequest.created_at.desc())
        .all()
    )
    return [BookingRequestOut.model_validate(item) for item in requests]


@router.put("/{request_id}/status", response_model=BookingRequestOut)
def update_request_status(
    request_id: int,
    payload: BookingRequestStatusUpdate,
    db: Session = Depends(get_db),
):
    request = (
        db.query(models.BookingRequest)
        .options(
            joinedload(models.BookingRequest.user),
            joinedload(models.BookingRequest.lawyer),
            joinedload(models.BookingRequest.booking),
        )
        .filter(models.BookingRequest.id == request_id)
        .first()
    )
    if request is None:
        raise HTTPException(status_code=404, detail="Booking request not found")

    status_normalized = payload.status.lower()
    if status_normalized not in ALLOWED_REQUEST_STATUSES:
        raise HTTPException(status_code=400, detail="Unsupported request status")

    setattr(request, "status", status_normalized)

    linked_booking = request.booking
    if status_normalized == "accepted":
        if linked_booking is None:
            fallback_date = request.preferred_date or datetime.utcnow().strftime("%Y-%m-%d")
            fallback_time = request.preferred_time or "09:00"
            linked_booking = models.Booking(
                user_id=request.user_id,
                lawyer_id=request.lawyer_id,
                booking_request_id=request.id,
                date=fallback_date,
                time=fallback_time,
                notes=request.notes,
                status="accepted",
            )
            db.add(linked_booking)
            request.booking = linked_booking
        else:
            linked_booking.status = "accepted"
            if linked_booking.date is None and request.preferred_date:
                linked_booking.date = request.preferred_date
            if linked_booking.time is None and request.preferred_time:
                linked_booking.time = request.preferred_time
    elif linked_booking is not None:
        linked_booking.status = "rejected" if status_normalized == "rejected" else status_normalized

    db.commit()
    db.refresh(request)

    return BookingRequestOut.model_validate(request)
