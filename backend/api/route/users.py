# app/api/routes/users.py

from fastapi import APIRouter, Depends, HTTPException, Response, status
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.schemas.user import UserCreate, UserOut
from app.db.database import get_db
from app.db import models

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserOut)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserOut.model_validate(user)


@router.get("", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [UserOut.model_validate(u) for u in users]


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    try:
        # Remove reviews written by the user
        db.query(models.Review).filter(models.Review.user_id == user_id).delete(synchronize_session=False)

        # Remove bookings made by the user (client)
        db.query(models.Booking).filter(models.Booking.user_id == user_id).delete(synchronize_session=False)

        # Clean up chat history (messages first, then sessions)
        session_ids = [s.id for s in db.query(models.ChatSession).filter(models.ChatSession.user_id == user_id).all()]
        if session_ids:
            db.query(models.ChatMessage).filter(models.ChatMessage.session_id.in_(session_ids)).delete(synchronize_session=False)
        db.query(models.ChatMessage).filter(models.ChatMessage.user_id == user_id).delete(synchronize_session=False)
        db.query(models.ChatSession).filter(models.ChatSession.user_id == user_id).delete(synchronize_session=False)

        # Remove uploaded documents owned by the user
        db.query(models.UploadedDocument).filter(models.UploadedDocument.user_id == user_id).delete(synchronize_session=False)

        # If the user is a lawyer, remove dependent entities and profile
        if user.lawyer_profile is not None:
            lawyer_id = user.lawyer_profile.id
            db.query(models.Review).filter(models.Review.lawyer_id == lawyer_id).delete(synchronize_session=False)
            db.query(models.Booking).filter(models.Booking.lawyer_id == lawyer_id).delete(synchronize_session=False)
            db.delete(user.lawyer_profile)

        db.delete(user)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user.",
        ) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
