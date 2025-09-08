import pandas as pd
import numpy as np
# Load tutors
df = pd.read_csv("example.csv")

# Define your requirements
requirements = {
    "Age": {"minAge": 17, "weight": 10},
    "School":   {"equals": "Castle", "weight": 1000},
    "SAT":   {"minSAT": 1500, "weight": 1000},
}

# Start everyone with score = 0
df["Score"] = 0

# Apply each requirement
for col, rule in requirements.items():
    if "minAge" in rule:
        df["Score"] -= (abs(df[col] - rule["minAge"])) * rule["weight"]
    if "minSAT" in rule:
        df["Score"] += (np.log((df[col] - rule["minSAT"])) * rule["weight"])
    if "max" in rule:
        df["Score"] += (df[col] <= rule["max"]) * rule["weight"]
    if "equals" in rule:
        df["Score"] += (df[col] == rule["equals"]) * rule["weight"]

# Sort by total score (highest first)
candidates = df.sort_values(by="Score", ascending=False)

# Pick top 3 (or more if you want)
top_candidates = candidates.head(3)

print(top_candidates)
