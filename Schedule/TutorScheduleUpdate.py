# reset_test_db.py
from sqlalchemy import create_engine, text
from datetime import datetime, date, timedelta
import random

# === CONFIG ===
DB_USER = "chscscom_jacob"
DB_PASS = "Jacoshark11"
DB_HOST = "mi3-cl8-its1.a2hosting.com"
DB_PORT = 3306
DB_NAME = "chscscom_tutortrack"

KEEP_COUNT = 30              # keep the first 30 tutors by id
DAYS_AHEAD = 14              # create/seed availability for today + this many days
START_HOUR = 8               # earliest hour (24h)
END_HOUR = 20                # latest hour (exclusive)
MIN_SLOTS = 1                # minimum number of hours per day
MAX_SLOTS = 5                # maximum number of hours per day

engine = create_engine(
    f"mysql+mysqlconnector://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
    pool_pre_ping=True,
)

# ---------- helpers ----------
def _ensure_unique_index_on_tutor(conn):
    """Make tutor_id unique so ON DUPLICATE KEY works."""
    try:
        conn.execute(text("ALTER TABLE Scheduling ADD UNIQUE KEY uk_tutor (tutor_id);"))
    except Exception:
        pass  # already exists or not needed

def _ensure_date_column(conn, col_name: str):
    """Add a date column `YYYY_MM_DD` if missing."""
    exists_sql = """
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'Scheduling'
          AND COLUMN_NAME = :col
    """
    if not conn.execute(text(exists_sql), {"col": col_name}).fetchone():
        conn.execute(text(f"ALTER TABLE Scheduling ADD COLUMN `{col_name}` VARCHAR(255) DEFAULT NULL;"))

def _to_col_name(yyyy_mm_dd: str) -> str:
    d = datetime.strptime(yyyy_mm_dd, "%Y-%m-%d")
    return d.strftime("%Y_%m_%d")

def _rand_hours(
    start_hour=START_HOUR,
    end_hour=END_HOUR,
    min_slots=MIN_SLOTS,
    max_slots=MAX_SLOTS
) -> list[int]:
    hours = list(range(start_hour, end_hour))  # whole hours
    k = random.randint(min_slots, min(max_slots, len(hours)))
    return sorted(random.sample(hours, k)) if k > 0 else []

# ---------- core steps ----------
def get_first_n_tutor_ids(conn, n: int) -> list[int]:
    rows = conn.execute(text("SELECT id FROM tutors ORDER BY id ASC LIMIT :n"), {"n": n}).fetchall()
    return [int(r[0]) for r in rows]

def delete_beyond_tutors(conn, keep_ids: list[int]):
    if not keep_ids:  # nothing to keep => nothing to delete (safety)
        return
    # Delete Scheduling rows for tutors not in keep_ids
    conn.execute(
        text(f"DELETE FROM Scheduling WHERE tutor_id NOT IN ({','.join([':k'+str(i) for i in range(len(keep_ids))])})"),
        {('k'+str(i)): keep_ids[i] for i in range(len(keep_ids))}
    )
    # Delete tutors not in keep_ids
    conn.execute(
        text(f"DELETE FROM tutors WHERE id NOT IN ({','.join([':k'+str(i) for i in range(len(keep_ids))])})"),
        {('k'+str(i)): keep_ids[i] for i in range(len(keep_ids))}
    )

def ensure_scheduling_rows(conn, tutor_ids: list[int]):
    _ensure_unique_index_on_tutor(conn)
    # Insert missing Scheduling rows for each tutor_id
    for tid in tutor_ids:
        conn.execute(
            text("INSERT IGNORE INTO Scheduling (tutor_id) VALUES (:tid)"),
            {"tid": tid}
        )

def ensure_date_columns(conn, start: date, days: int) -> list[str]:
    cols = []
    for i in range(days + 1):
        d = start + timedelta(days=i)
        col = d.strftime("%Y_%m_%d")
        _ensure_date_column(conn, col)
        cols.append(col)
    return cols

def seed_random_availability(conn, tutor_ids: list[int], col_names: list[str]):
    # For each tutor, set random hours for each date col
    for tid in tutor_ids:
        params = {"tutor_id": tid}
        placeholders = [":tutor_id"]
        cols = ["tutor_id"]
        for col in col_names:
            hrs = _rand_hours()
            params[col] = ",".join(str(h) for h in hrs)
            placeholders.append(f":{col}")
            cols.append(f"`{col}`")
        ondup = ", ".join([f"`{c}`=VALUES(`{c}`)" for c in col_names])
        sql = f"INSERT INTO Scheduling ({', '.join(cols)}) VALUES ({', '.join(placeholders)}) ON DUPLICATE KEY UPDATE {ondup};"
        conn.execute(text(sql), params)

def reset_and_seed():
    today = date.today()
    with engine.connect() as conn:
        # 1) Determine the first KEEP_COUNT tutors
        keep_ids = get_first_n_tutor_ids(conn, KEEP_COUNT)
        if len(keep_ids) < KEEP_COUNT:
            print(f"⚠️ Only {len(keep_ids)} tutor(s) found; proceeding with those.")
        else:
            print(f"Keeping tutor IDs: {keep_ids[0]} … {keep_ids[-1]} ({len(keep_ids)} total)")

        # 2) Delete everything beyond those tutors (Scheduling first, then tutors)
        delete_beyond_tutors(conn, keep_ids)

        # 3) Ensure Scheduling has a row for each kept tutor
        ensure_scheduling_rows(conn, keep_ids)

        # 4) Ensure date columns exist for today .. today + DAYS_AHEAD
        col_names = ensure_date_columns(conn, today, DAYS_AHEAD)

        # 5) Seed random availability for kept tutors over those columns
        seed_random_availability(conn, keep_ids, col_names)

        conn.commit()

    print(f"✅ Reset complete: kept {len(keep_ids)} tutor(s), wiped others, and seeded {len(col_names)} day(s) of availability.")

if __name__ == "__main__":
    reset_and_seed()
