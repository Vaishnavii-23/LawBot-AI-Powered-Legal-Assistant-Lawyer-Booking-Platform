# app/api/routes/bookings.py

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session

from app.schemas.booking import BookingCreate, BookingOut, BookingStatusUpdate
from app.db.database import get_db
from app.db import models

router = APIRouter(prefix="/bookings", tags=["bookings"])

ALLOWED_BOOKING_STATUSES = {"pending", "accepted", "rejected", "completed", "cancelled"}


@router.post("", response_model=BookingOut)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
):
    # Check user exists and is a normal user
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "user":
        raise HTTPException(status_code=400, detail="Only normal users can book lawyers")

    # Check lawyer profile exists
    lawyer_profile = (
        db.query(models.LawyerProfile)
        .filter(models.LawyerProfile.id == payload.lawyer_id)
        .first()
    )
    if lawyer_profile is None:
        raise HTTPException(status_code=404, detail="Lawyer profile not found")

    linked_request = None
    if payload.booking_request_id is not None:
        linked_request = (
            db.query(models.BookingRequest)
            .filter(models.BookingRequest.id == payload.booking_request_id)
            .first()
        )
        if linked_request is None:
            raise HTTPException(status_code=404, detail="Booking request not found")
        if linked_request.user_id != payload.user_id or linked_request.lawyer_id != payload.lawyer_id:
            raise HTTPException(status_code=400, detail="Booking request does not match user and lawyer")
        existing_booking = (
            db.query(models.Booking)
            .filter(models.Booking.booking_request_id == payload.booking_request_id)
            .first()
        )
        if existing_booking is not None:
            raise HTTPException(status_code=400, detail="Booking already exists for this request")

    booking = models.Booking(
        user_id=payload.user_id,
        lawyer_id=payload.lawyer_id,
        booking_request_id=payload.booking_request_id,
        date=payload.date,
        time=payload.time,
        notes=payload.notes,
        status="pending",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return BookingOut.model_validate(booking)


@router.get("/user/{user_id}", response_model=List[BookingOut])
def list_user_bookings(user_id: int, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(models.Booking.user_id == user_id).all()
    return [BookingOut.model_validate(b) for b in bookings]


@router.get("/lawyer/{lawyer_id}", response_model=List[BookingOut])
def list_lawyer_bookings(lawyer_id: int, db: Session = Depends(get_db)):
    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.lawyer_id == lawyer_id)
        .all()
    )
    return [BookingOut.model_validate(b) for b in bookings]


@router.put("/{booking_id}/status", response_model=BookingOut)
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(models.Booking)
        .filter(models.Booking.id == booking_id)
        .first()
    )
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    normalized_status = payload.status.lower()
    if normalized_status not in ALLOWED_BOOKING_STATUSES:
        raise HTTPException(status_code=400, detail="Unsupported booking status")

    booking.status = normalized_status
    db.commit()
    db.refresh(booking)

    return BookingOut.model_validate(booking)
