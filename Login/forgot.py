from flask import Flask, request, jsonify
from flask_cors import CORS
import csv, os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def email_exists(email):
    csv_path = os.path.join(BASE_DIR, "login.csv")
    with open(csv_path, newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        # assumes your CSV has a column "username" or "email"
        for row in reader:
            if row.get("username") == email or row.get("email") == email:
                return True
    return False

@app.route("/forgot", methods=["POST"])
def forgot():
    email = request.form.get("email") or request.json.get("email")
    print(" Forgot password request for:", email)

    if not email:
        return jsonify({"success": False, "message": "No email provided."}), 400

    if email_exists(email):
        # Simulate sending email
        print(f" Sent reset link to {email}")
        return jsonify({"success": True, "message": "Reset link sent to your email."})
    else:
        return jsonify({"success": False, "message": "Email not found."}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5001)  # run on 5001 so it doesn’t collide with login.py
