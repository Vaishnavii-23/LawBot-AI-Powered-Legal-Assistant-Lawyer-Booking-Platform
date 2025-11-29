# app/chat/category.py

def detect_category(message: str) -> str:
    text = message.lower()

    # Very simple rules – you can improve later
    if any(word in text for word in ["divorce", "marriage", "custody", "wife", "husband"]):
        return "Family Law"

    if any(word in text for word in ["tenant", "landlord", "rent", "rented", "property", "flat", "house"]):
        return "Property / Rent Law"

    if any(word in text for word in ["fir", "police", "ipc", "nyaya sanhita", "theft", "assault", "murder"]):
        return "Criminal Law"

    if any(word in text for word in ["job", "salary", "company", "employer", "terminated", "fired"]):
        return "Labour / Employment Law"

    if any(word in text for word in ["online", "social media", "instagram", "facebook", "hacking", "cyber"]):
        return "Cyber Law"

    if any(word in text for word in ["accident", "driving licence", "dl", "vehicle", "bike", "car", "traffic"]):
        return "Motor Vehicle Law"

    if any(word in text for word in ["harassment", "dowry", "domestic violence", "stalking"]):
        return "Women's Rights"

    if any(word in text for word in ["mental health", "depression", "psychiatric", "mental hospital"]):
        return "Mental Health Law"

    return "Other"
