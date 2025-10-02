from sqlalchemy import create_engine, text
import pandas as pd
from datetime import datetime

# --- Database setup ---
user = "chscscom_jacob"
password = "Jacoshark11"
host = "mi3-cl8-its1.a2hosting.com"
port = 3306
db = "chscscom_tutortrack"

engine = create_engine(f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db}")

def update_schedule(tutor_id: int, slot_date: str, hours: list[int]):
    """
    Update a tutor's schedule for a given date with hours available (military time).
    
    tutor_id: int -> The tutor's ID from tutors table
    slot_date: str -> Date in 'YYYY-MM-DD' format
    hours: list[int] -> List of hours available in military time, e.g. [9, 10, 14]
    """

    # Convert date into the column format (e.g. 2025-10-01 → 2025_10_01)
    try:
        d = datetime.strptime(slot_date, "%Y-%m-%d")
    except ValueError:
        raise ValueError("Date must be in YYYY-MM-DD format")

    col_name = d.strftime("%Y_%m_%d")

    # Format hours as a string (like "09,10,14,15")
    hours_str = ",".join(str(h) for h in hours)

    # Insert or update row
    sql = f"""
    INSERT INTO Scheduling (tutor_id, `{col_name}`)
    VALUES (:tutor_id, :hours_str)
    ON DUPLICATE KEY UPDATE `{col_name}` = :hours_str;
    """

    with engine.connect() as conn:
        conn.execute(
            text(sql),
            {"tutor_id": tutor_id, "hours_str": hours_str}
        )
        conn.commit()

    print(f" Updated tutor {tutor_id} for {slot_date} with hours: {hours_str}")


# --- Example usage ---
if __name__ == "__main__":
    # Example: tutor 1, available on 2025-10-01 from 9am, 10am, 2pm, 3pm
    update_schedule(
        tutor_id=10,
        slot_date="2025-10-11",
        hours=[9, 10, 14, 15]
    )
