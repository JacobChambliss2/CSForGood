import mysql.connector
import random

# Connection details
conn = mysql.connector.connect(
    host="mi3-cl8-its1.a2hosting.com",
    user="chscscom_jacob",
    password="Jacoshark11",
    database="chscscom_tutortrack",
    port=3306
)

cursor = conn.cursor()

# Sample data pools
first_names = [
    "Liam", "Emma", "Noah", "Olivia", "Ava", "Isabella", "Sophia",
    "Mason", "James", "Lucas", "Mia", "Charlotte", "Amelia", "Ethan",
    "Harper", "Evelyn", "Benjamin", "Elijah", "Daniel", "Alexander"
]

last_names = ["Smith", "Johnson", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor"]

schools = ["Castle", "Memorial", "North", "Central", "Reitz"]

def generate_tutor():
    """Generate one random tutor row."""
    return (
        random.choice(first_names),
        random.choice(last_names),
        random.randint(14, 18),              # age
        random.choice(schools),              # school
        random.randint(800, 1600),           # sat_score
        random.randint(1, 30)                # distance
    )

def clear_tutors():
    """Delete all rows in the tutors table."""
    cursor.execute("TRUNCATE TABLE tutors;")
    conn.commit()
    print(" Cleared tutors table.")

def insert_tutors(n=500):
    """Insert n random tutors into the database."""
    sql = """
    INSERT INTO tutors (first_name, last_name, age, school, sat_score, distance)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    data = [generate_tutor() for _ in range(n)]
    cursor.executemany(sql, data)
    conn.commit()
    print(f" Inserted {n} tutors into database.")

if __name__ == "__main__":
    clear_tutors()       # clear existing rows
    insert_tutors(500)   # then add fresh tutors
    cursor.close()
    conn.close()
