# app/db/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import urllib.parse

# ---- PostgreSQL settings ----
DB_USER = "postgres"
DB_PASSWORD = "root"  # <-- yahan woh password jo tumne install ke time diya
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "lawbot"
# ------------------------------

password_quoted = urllib.parse.quote_plus(DB_PASSWORD)

SQLALCHEMY_DATABASE_URL = (
    f"postgresql+psycopg2://{DB_USER}:{password_quoted}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True,     # SQL logs dekhne ke liye; later False kar sakti ho
    future=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
