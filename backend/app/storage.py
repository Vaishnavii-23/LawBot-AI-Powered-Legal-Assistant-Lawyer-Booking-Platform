from typing import List
from app.schemas.user import UserOut
from app.schemas.lawyer import LawyerProfileOut
from app.schemas.booking import BookingOut
from app.schemas.review import ReviewOut

# In-memory "tables"
users_db: List[UserOut] = []
lawyers_db: List[LawyerProfileOut] = []
bookings_db: List[BookingOut] = []
reviews_db: List[ReviewOut] = []

# Auto-increment IDs
next_user_id: int = 1
next_lawyer_id: int = 1
next_booking_id: int = 1
next_review_id: int = 1
