from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
import os

app = Flask(__name__)

# Allow requests from your Live Server origin (5500) for all routes
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def check_credentials(email, password):
    csv_path = os.path.join(BASE_DIR, "login.csv")  # always use the file in the same folder as login.py
    with open(csv_path, newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row["email"] == email and row["password"] == password:
                return True
    return False


@app.route("/login", methods=["POST"])
def login():
    email = request.form.get("email")
    password = request.form.get("password")

    if check_credentials(email, password):
        return jsonify({"success": True})
    else:
        return jsonify({"success": False})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
