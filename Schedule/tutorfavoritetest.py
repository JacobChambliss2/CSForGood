# UpdateFavorites.py
from sqlalchemy import create_engine, text
from typing import List
import random

# --- Database setup (same creds you use elsewhere) ---
user = "chscscom_jacob"
password = "Jacoshark11"
host = "mi3-cl8-its1.a2hosting.com"
port = 3306
db = "chscscom_tutortrack"

engine = create_engine(f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db}")

def ensure_favorited_column() -> None:
    """Add tutors.favorited if it does not exist."""
    check_sql = text("""
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'tutors'
          AND COLUMN_NAME = 'favorited'
    """)
    alter_sql = text("ALTER TABLE tutors ADD COLUMN favorited TINYINT(1) NOT NULL DEFAULT 0")
    with engine.begin() as conn:
        exists = conn.execute(check_sql).scalar_one()
        if not exists:
            conn.execute(alter_sql)

def list_tutor_ids() -> List[int]:
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT id FROM tutors ORDER BY id")).fetchall()
        return [int(r[0]) for r in rows]

def reset_all_favorites() -> None:
    with engine.begin() as conn:
        conn.execute(text("UPDATE tutors SET favorited = 0"))

def set_favorites(tutor_ids: List[int]) -> None:
    if not tutor_ids:
        return
    # Use a single UPDATE with IN clause
    placeholders = ",".join([str(int(i)) for i in tutor_ids])
    sql = text(f"UPDATE tutors SET favorited = 1 WHERE id IN ({placeholders})")
    with engine.begin() as conn:
        conn.execute(sql)

def main(count: int = 4) -> None:
    ensure_favorited_column()
    ids = list_tutor_ids()
    if not ids:
        print("No tutors found.")
        return

    k = min(count, len(ids))
    # Randomly choose k unique tutors
    chosen = random.sample(ids, k)

    reset_all_favorites()
    set_favorites(chosen)

    print("=== Favorites Updated ===")
    print(f"Total tutors: {len(ids)}")
    print(f"Marked as favorited ({k}): {sorted(chosen)}")

if __name__ == "__main__":
    # Change the number if you want more/less than 4:
    # e.g., main(6)
    main(4)
