"""Expose individual API route modules for FastAPI app inclusion."""

from . import auth, booking_requests, bookings, chat, lawyers, reviews, users

__all__ = [
	"auth",
	"booking_requests",
	"bookings",
	"chat",
	"lawyers",
	"reviews",
	"users",
]
