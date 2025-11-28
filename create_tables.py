# create_tables.py

from app.db.database import engine, Base
import app.db.models  # important: this registers models with Base

if __name__ == "__main__":
    print("Creating tables in PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    print("Done.")
