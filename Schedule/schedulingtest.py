# TutorStats.py
from sqlalchemy import create_engine, text
from typing import List, Tuple

# --- Database setup (same creds you use elsewhere) ---
user = "chscscom_jacob"
password = "Jacoshark11"
host = "mi3-cl8-its1.a2hosting.com"
port = 3306
db = "chscscom_tutortrack"

engine = create_engine(f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db}")

def count_tutors() -> int:
    with engine.connect() as conn:
        n = conn.execute(text("SELECT COUNT(*) FROM tutors;")).scalar_one()
        return int(n)

def list_tutor_ids() -> List[int]:
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT id FROM tutors ORDER BY id;")).fetchall()
        return [int(r[0]) for r in rows]

def count_unique_scheduling_tutors() -> int:
    with engine.connect() as conn:
        n = conn.execute(text("SELECT COUNT(DISTINCT tutor_id) FROM Scheduling;")).scalar_one()
        return int(n)

def tutors_missing_in_scheduling() -> List[int]:
    """
    Tutors that exist in tutors.id but have no corresponding row in Scheduling.tutor_id.
    (Assumes one Scheduling row per tutor_id.)
    """
    sql = """
    SELECT t.id
    FROM tutors t
    LEFT JOIN Scheduling s ON s.tutor_id = t.id
    WHERE s.tutor_id IS NULL
    ORDER BY t.id;
    """
    with engine.connect() as conn:
        rows = conn.execute(text(sql)).fetchall()
        return [int(r[0]) for r in rows]

def scheduling_orphans() -> List[int]:
    """
    Scheduling rows whose tutor_id does not exist in tutors.id.
    (Should be empty if you maintain referential integrity.)
    """
    sql = """
    SELECT s.tutor_id
    FROM Scheduling s
    LEFT JOIN tutors t ON t.id = s.tutor_id
    WHERE t.id IS NULL
    ORDER BY s.tutor_id;
    """
    with engine.connect() as conn:
        rows = conn.execute(text(sql)).fetchall()
        return [int(r[0]) for r in rows]

def list_scheduling_date_columns() -> List[str]:
    """
    Lists all date-like columns (YYYY_MM_DD) in Scheduling.
    Helpful to see what days are currently supported.
    """
    sql = """
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Scheduling'
      AND COLUMN_NAME REGEXP '^[0-9]{4}_[0-9]{2}_[0-9]{2}$'
    ORDER BY COLUMN_NAME;
    """
    with engine.connect() as conn:
        rows = conn.execute(text(sql)).fetchall()
        return [str(r[0]) for r in rows]

if __name__ == "__main__":
    total = count_tutors()
    ids = list_tutor_ids()
    sched_count = count_unique_scheduling_tutors()
    missing = tutors_missing_in_scheduling()
    orphans = scheduling_orphans()
    date_cols = list_scheduling_date_columns()

    print("=== Tutor Stats ===")
    print(f"Total tutors in tutors: {total}")
    print(f"Tutor IDs: {ids}")

    print("\n=== Scheduling Coverage ===")
    print(f"Distinct tutor_id in Scheduling: {sched_count}")
    print(f"Tutors with NO Scheduling row: {missing or 'None'}")
    print(f"Scheduling rows pointing to missing tutors (orphans): {orphans or 'None'}")

    print("\n=== Scheduling Date Columns ===")
    print(f"{len(date_cols)} date columns found")
    print(date_cols if date_cols else "None")
