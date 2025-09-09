import pandas as pd

# Load tutors
df = pd.read_csv("example.csv")

# Keep only active tutors
df = df[df["Active"] == True].reset_index(drop=True)

# Define requirements and weights
requirements = {
    "Age": {"target": 15, "weight": 1.0},      
    "School": {"equals": "Castle", "weight": 1.0},
    "SAT": {"min": 400, "max": 1600, "weight": 1.0},  
    "distance": {"weight": 1.0},  
}

def normalize_scores(df, reqs):
    scores = pd.DataFrame(index=df.index)

    # Age: closer to target is better
    if "Age" in reqs:
        target = reqs["Age"]["target"]
        max_diff = df["Age"].sub(target).abs().max()
        scores["Age"] = 1 - (df["Age"].sub(target).abs() / max_diff)

    # School: exact match = 1, else 0
    if "School" in reqs:
        school = reqs["School"]["equals"]
        scores["School"] = (df["School"] == school).astype(float)

    # SAT: scale between min and max
    if "SAT" in reqs:
        sat_min, sat_max = df["SAT"].min(), df["SAT"].max()
        scores["SAT"] = (df["SAT"] - sat_min) / (sat_max - sat_min)


    # Distance: smaller = better
    if "distance" in reqs:
        max_dist = df["distance"].max()
        scores["distance"] = 1 - (df["distance"] / max_dist)

    return scores.clip(0, 1)

# Compute scores
scores = normalize_scores(df, requirements)

# Apply weights
weights = {k: v["weight"] for k, v in requirements.items()}
weight_sum = sum(weights.values())

df["Score"] = sum(scores[col] * weights[col] for col in scores.columns) / weight_sum

# Sort candidates
candidates = df.sort_values(by="Score", ascending=False)

print(candidates.head(10))
