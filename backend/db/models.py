# app/db/models.py

from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # "user" or "lawyer"

    # relationships
    lawyer_profile = relationship("LawyerProfile", back_populates="user", uselist=False)
    bookings = relationship("Booking", back_populates="user")
    booking_requests = relationship("BookingRequest", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")
    chat_sessions = relationship("ChatSession", back_populates="user")
    uploaded_documents = relationship("UploadedDocument", back_populates="user")


class LawyerProfile(Base):
    __tablename__ = "lawyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    city = Column(String(100), nullable=False)
    specialization = Column(String(255), nullable=False)  # e.g. "divorce", "property"
    experience_years = Column(Integer, nullable=False)
    hourly_rate = Column(Float, nullable=False)
    bio = Column(Text, nullable=True)

    user = relationship("User", back_populates="lawyer_profile")
    bookings = relationship("Booking", back_populates="lawyer")
    booking_requests = relationship("BookingRequest", back_populates="lawyer")
    reviews = relationship("Review", back_populates="lawyer")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lawyer_id = Column(Integer, ForeignKey("lawyer_profiles.id", ondelete="CASCADE"), nullable=False)
    booking_request_id = Column(
        Integer,
        ForeignKey("booking_requests.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
    )

    date = Column(String(20), nullable=False)   # you can later switch to Date
    time = Column(String(20), nullable=False)   # or Time/DateTime
    notes = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="pending")

    user = relationship("User", back_populates="bookings")
    lawyer = relationship("LawyerProfile", back_populates="bookings")
    booking_request = relationship("BookingRequest", back_populates="booking", uselist=False)
    reviews = relationship("Review", back_populates="booking")


class BookingRequest(Base):
    __tablename__ = "booking_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lawyer_id = Column(Integer, ForeignKey("lawyer_profiles.id", ondelete="CASCADE"), nullable=False)
    preferred_date = Column(String(20), nullable=True)
    preferred_time = Column(String(20), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="booking_requests")
    lawyer = relationship("LawyerProfile", back_populates="booking_requests")
    booking = relationship("Booking", back_populates="booking_request", uselist=False)

    @property
    def booking_id(self) -> int | None:  # type: ignore[override]
        return self.booking.id if self.booking else None


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lawyer_id = Column(Integer, ForeignKey("lawyer_profiles.id", ondelete="CASCADE"), nullable=False)

    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)

    booking = relationship("Booking", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
    lawyer = relationship("LawyerProfile", back_populates="reviews")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="SET NULL"), nullable=True)

    user = relationship("User", back_populates="chat_messages")
    session = relationship("ChatSession", back_populates="messages")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_activity_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session")


class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    original_filename = Column(String(255), nullable=False)
    stored_path = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="uploaded_documents")
