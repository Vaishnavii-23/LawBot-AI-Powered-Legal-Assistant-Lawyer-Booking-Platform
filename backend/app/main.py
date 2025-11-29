# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    auth,
    booking_requests,
    bookings,
    chat,
    lawyers,
    reviews,
    users,
)

app = FastAPI(
    title="LawBot Backend",
    version="0.1.0",
    description="Legal help playground backend (users, lawyers, bookings, reviews, RAG chat) with PostgreSQL.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "LawBot backend is running. Go to /docs for API documentation."}


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(users.router)
app.include_router(lawyers.router)
app.include_router(bookings.router)
app.include_router(booking_requests.router)
app.include_router(reviews.router)
app.include_router(chat.router)
app.include_router(auth.router)
