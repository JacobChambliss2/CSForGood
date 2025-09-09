import pandas as pd
import numpy as np
import random

# Settings
n_rows = 1000  # change this to however many tutors you want

names_first = ["Charlie", "Sophie", "Daniel", "Olivia", "James", "Emma",
               "Liam", "Noah", "Ava", "Mason", "Ella", "Lucas", "Mia",
               "Henry", "Amelia", "Ethan", "Harper", "Jack", "Isabella", "Logan"]
names_last = ["Williams", "Johnson", "Kim", "Brown", "Miller", "Davis",
              "Smith", "Jones", "Garcia", "Martinez", "Taylor", "Moore",
              "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin"]

schools = ["Castle", "Westfield", "Memorial", "North", "South", "Central"]

rows = []
for _ in range(n_rows):
    name = f"{random.choice(names_first)} {random.choice(names_last)}"
    age = random.randint(15, 20)  # tutor age range
    school = random.choice(schools)
    sat = random.randint(800, 1600)  # SAT scores
    active = random.choice([True, False])
    distance = random.randint(1, 30)  # miles

    rows.append({
        "Name": name,
        "Age": age,
        "School": school,
        "SAT": sat,
        "Active": active,
        "distance": distance
    })

df = pd.DataFrame(rows)
df.to_csv("example.csv", index=False)

print("Randomized example.csv created with", n_rows, "rows")
