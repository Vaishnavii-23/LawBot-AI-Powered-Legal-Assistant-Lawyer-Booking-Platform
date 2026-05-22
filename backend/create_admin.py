import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.db.models import User
from app.utils.security import hash_password

def create_admin():
    db = SessionLocal()
    email = "admin@lawbot.com"
    password = "adminpassword"
    
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.email == email).first()
    if existing_admin:
        print(f"Admin already exists with email: {email}")
        db.close()
        return

    admin_user = User(
        email=email,
        full_name="Admin",
        password_hash=hash_password(password),
        role="admin"
    )
    
    db.add(admin_user)
    db.commit()
    db.close()
    print(f"Admin created successfully! Email: {email}, Password: {password}")

if __name__ == "__main__":
    create_admin()
