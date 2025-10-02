import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine

# database setup
user = "chscscom_jacob"
password = "Jacoshark11"
host = "mi3-cl8-its1.a2hosting.com"
port = 3306
db = "chscscom_tutortrack"

engine = create_engine(f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db}")

# show more decimal places when printing
pd.set_option("display.precision", 12)

def get_tutors():
    df = pd.read_sql("SELECT * FROM tutors", engine)
    df.rename(columns={
        "age": "Age",
        "school": "School",
        "sat_score": "SAT",
        "distance": "distance"
    }, inplace=True)
    df["Active"] = True
    return df[df["Active"] == True].reset_index(drop=True)

def normalize_scores(df, reqs):
    scores = pd.DataFrame(index=df.index)

    # age
    target = reqs["Age"]["target"]
    max_diff = df["Age"].sub(target).abs().max()
    scores["Age"] = 1 if max_diff == 0 else 1 - (df["Age"].sub(target).abs() / max_diff)

    # school
    scores["School"] = (df["School"] == reqs["School"]["equals"]).astype(float)

    # sat
    sat_min, sat_max = df["SAT"].min(), df["SAT"].max()
    scores["SAT"] = 1 if sat_max == sat_min else (df["SAT"] - sat_min) / (sat_max - sat_min)

    # distance
    max_dist = df["distance"].max()
    scores["distance"] = 1 if max_dist == 0 else 1 - (df["distance"] / max_dist)

    return scores

def rank_tutors(age_target=15, school_target="Castle", sat_weight=5.0, distance_weight=1.0):
    df = get_tutors()
    requirements = {
        "Age": {"target": age_target, "weight": 1},
        "School": {"equals": school_target, "weight": 1},
        "SAT": {"min": 400, "max": 1600, "weight": sat_weight},
        "distance": {"weight": distance_weight}
    }

    scores = normalize_scores(df, requirements)
    weights = {k: v["weight"] for k, v in requirements.items()}
    weight_sum = sum(weights.values())
    df["Score"] = sum(scores[col] * weights[col] for col in scores.columns) / weight_sum

    # add deterministic tie-breaker in case of exact score ties
    return df.sort_values(
        by=["Score", "SAT", "distance"],
        ascending=[False, True, False]
    ).head(10)

app = Flask(__name__)
CORS(app)

@app.route("/rank", methods=["POST"])
def rank():
    data = request.json or {}

    results = rank_tutors(
        age_target=int(data.get("Age", 17)),
        school_target=data.get("School", "Castle"),
        sat_weight=float(data.get("SAT_weight", 5)),
        distance_weight=float(data.get("distance_weight", 1))
    )

    print("\nTop tutors:")
    print(results[["first_name", "last_name", "Age", "School", "SAT", "distance", "Score"]])

    # send more decimal places for Score in JSON
    results["Score"] = results["Score"].apply(lambda x: round(float(x), 12))
    return jsonify(results.to_dict(orient="records"))

if __name__ == "__main__":
    initial = rank_tutors()
    print("Initial ranking with defaults:")
    print(initial[["id","first_name", "last_name", "Age", "School", "SAT", "distance", "Score"]])
    app.run(debug=True)
