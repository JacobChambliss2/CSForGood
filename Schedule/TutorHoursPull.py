from sqlalchemy import create_engine, text
from datetime import datetime

# --- Database setup ---
user = "chscscom_jacob"
password = "Jacoshark11"
host = "mi3-cl8-its1.a2hosting.com"
port = 3306
db = "chscscom_tutortrack"

engine = create_engine(f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db}")

def get_available_hours(tutor_id: int, slot_date: str):

    # Convert date string into column format (e.g. 2025-10-01 -> 2025_10_01)
    try:
        d = datetime.strptime(slot_date, "%Y-%m-%d")
    except ValueError:
        raise ValueError("Date must be in YYYY-MM-DD format")
    
    col_name = d.strftime("%Y_%m_%d")

    # Build query
    sql = f"""
    SELECT `{col_name}`
    FROM Scheduling
    WHERE tutor_id = :tutor_id;
    """

    with engine.connect() as conn:
        result = conn.execute(text(sql), {"tutor_id": tutor_id}).fetchone()

    if not result:
        return []  # tutor not found
    if result[0] is None:
        return []  # no hours set yet
    
    # Split comma-separated string into list of hours
    hours = [h.strip() for h in result[0].split(",")]
    return hours


# --- Example usage ---
if __name__ == "__main__":
    tutor_id = 10
    slot_date = "2025-10-11"
    hours = get_available_hours(tutor_id, slot_date)
    print(f" Tutor {tutor_id} is available on {slot_date} at hours: {hours}")
