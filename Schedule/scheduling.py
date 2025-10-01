from sqlalchemy import create_engine, text
import pandas as pd
from datetime import date, timedelta

# --- Database setup ---
user = "chscscom_jacob"
password = "Jacoshark11"
host = "mi3-cl8-its1.a2hosting.com"
port = 3306
db = "chscscom_tutortrack"

engine = create_engine(f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db}")

def create_schedule_table(days_ahead=7):
    today = date.today()
    
    # Build columns for each upcoming day
    date_columns = []
    for i in range(days_ahead):
        d = today + timedelta(days=i)
        col_name = d.strftime("%Y_%m_%d")  # safe SQL column name
        date_columns.append(f"`{col_name}` VARCHAR(20) DEFAULT NULL")
    
    # Drop the old table, then create the new one
    drop_sql = "DROP TABLE IF EXISTS Scheduling;"
    create_sql = f"""
    CREATE TABLE Scheduling (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        tutor_id INT NOT NULL,
        {", ".join(date_columns)},
        FOREIGN KEY (tutor_id) REFERENCES tutor(id)
    );
    """
    
    with engine.connect() as conn:
        conn.execute(text(drop_sql))   # remove old table
        conn.execute(text(create_sql)) # create new one
        conn.commit()

create_schedule_table(days_ahead=7)
