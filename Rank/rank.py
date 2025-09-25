import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

import mysql.connector

conn = mysql.connector.connect(
    host="mi3-cl8-its1.a2hosting.com",
    user="chscscom_jacob",
    password="Jacoshark11",
    database="chscscom_tutortrack",
    port=3306                  
)

df = pd.read_sql("SELECT * FROM tutors", conn)

df.rename(columns={
    "age": "Age",
    "school": "School",
    "sat_score": "SAT",
    "distance": "distance"
}, inplace=True)

# add Active column
df["Active"] = True
df = df[df["Active"] == True].reset_index(drop=True)

# Define requirements and weights
requirements = {
    "Age": {"target": 17, "weight": 1.0},      
    "School": {"equals": "Castle", "weight": 1.0},
    "SAT": {"min": 400, "max": 1600, "weight": 1000.0},  
    "distance": {"weight": 1.0},  
}

def normalize_scores(df, reqs):
    scores = pd.DataFrame(index=df.index)

    # Age: closer to target is better
    if "Age" in reqs:
        target = reqs["Age"]["target"]
        max_diff = df["Age"].sub(target).abs().max()
        if max_diff == 0:
            scores["Age"] = 1.0
        else:
            scores["Age"] = 1 - (df["Age"].sub(target).abs() / max_diff)

    # School: exact match = 1, else 0
    if "School" in reqs:
        school = reqs["School"]["equals"]
        scores["School"] = (df["School"] == school).astype(float)

    # SAT: scale between min and max
    if "SAT" in reqs:
        sat_min, sat_max = df["SAT"].min(), df["SAT"].max()
        if sat_max == sat_min:
            scores["SAT"] = 1.0
        else:
            scores["SAT"] = (df["SAT"] - sat_min) / (sat_max - sat_min)

    # Distance: smaller = better
    if "distance" in reqs:
        max_dist = df["distance"].max()
        if max_dist == 0:
            scores["distance"] = 1.0
        else:
            scores["distance"] = 1 - (df["distance"] / max_dist)

    return scores.clip(0, 1)
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

app = Flask(__name__)
CORS(app)

@app.route("/rank", methods=["POST"])
def rank():
    data = request.json

    # take input values from HTML/JS
    age_target = int(data.get("Age", 13))
    school_target = data.get("School", "Castle")
    sat_weight = float(data.get("SAT_weight", 1000.0))
    distance_weight = float(data.get("distance_weight", 1.0))

    # update requirements dynamically
    requirements["Age"]["target"] = age_target
    requirements["School"]["equals"] = school_target
    requirements["SAT"]["weight"] = sat_weight
    requirements["distance"]["weight"] = distance_weight

    # recompute scores
    scores = normalize_scores(df, requirements)
    weights = {k: v["weight"] for k, v in requirements.items()}
    weight_sum = sum(weights.values())
    df["Score"] = sum(scores[col] * weights[col] for col in scores.columns) / weight_sum

    candidates = df.sort_values(by="Score", ascending=False).head(10)
    return jsonify(candidates.to_dict(orient=""))

if __name__ == "__main__":
    app.run(debug=True)
