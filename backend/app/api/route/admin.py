# app/api/route/admin.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from app.db import models
from app.db.database import get_db
from app.schemas.user import UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


def verify_admin(db: Session = Depends(get_db)):
    """Middleware to verify admin access - will be enhanced with actual auth in future"""
    # TODO: Implement JWT token validation to check admin role
    return True


@router.get("/users", response_model=List[UserOut])
def get_all_users(db: Session = Depends(get_db), _=Depends(verify_admin)):
    """Get all users (admin only)"""
    users = db.query(models.User).filter(models.User.role == "user").all()
    return [UserOut.model_validate(u) for u in users]


@router.get("/advocates", response_model=List[UserOut])
def get_all_advocates(db: Session = Depends(get_db), _=Depends(verify_admin)):
    """Get all advocates/lawyers (admin only)"""
    advocates = db.query(models.User).filter(models.User.role == "lawyer").all()
    return [UserOut.model_validate(u) for u in advocates]


@router.get("/stats")
def get_platform_stats(db: Session = Depends(get_db), _=Depends(verify_admin)):
    """Get platform statistics (admin only)"""
    total_users = db.query(models.User).filter(models.User.role == "user").count()
    total_advocates = db.query(models.User).filter(models.User.role == "lawyer").count()
    total_bookings = db.query(models.Booking).count()
    
    # Get pending booking requests
    pending_requests = db.query(models.BookingRequest).filter(
        models.BookingRequest.status == "pending"
    ).count() if hasattr(models.BookingRequest, 'status') else 0

    return {
        "total_users": total_users,
        "total_advocates": total_advocates,
        "total_bookings": total_bookings,
        "pending_requests": pending_requests,
    }


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_admin(user_id: int, db: Session = Depends(get_db), _=Depends(verify_admin)):
    """Delete a user (admin only)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete admin users"
        )
    
    db.delete(user)
    db.commit()


@router.delete("/advocates/{advocate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_advocate_admin(advocate_id: int, db: Session = Depends(get_db), _=Depends(verify_admin)):
    """Delete an advocate (admin only)"""
    advocate = db.query(models.User).filter(
        models.User.id == advocate_id,
        models.User.role == "lawyer"
    ).first()
    
    if not advocate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Advocate not found")
    
    db.delete(advocate)
    db.commit()


@router.get("/users/{user_id}", response_model=UserOut)
def get_user_details(user_id: int, db: Session = Depends(get_db), _=Depends(verify_admin)):
    """Get detailed info about a user (admin only)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return UserOut.model_validate(user)


@router.get("/advocates/{advocate_id}", response_model=UserOut)
def get_advocate_details(advocate_id: int, db: Session = Depends(get_db), _=Depends(verify_admin)):
    """Get detailed info about an advocate (admin only)"""
    advocate = db.query(models.User).filter(
        models.User.id == advocate_id,
        models.User.role == "lawyer"
    ).first()
    
    if not advocate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Advocate not found")
    
    return UserOut.model_validate(advocate)


@router.get("/bookings")
def get_all_bookings(db: Session = Depends(get_db), _=Depends(verify_admin)):
    """Get all bookings on platform (admin only)"""
    bookings = db.query(models.Booking).all()
    return bookings


@router.get("/booking-requests")
def get_all_booking_requests(db: Session = Depends(get_db), _=Depends(verify_admin)):
    """Get all booking requests on platform (admin only)"""
    requests = db.query(models.BookingRequest).all()
    return requests
