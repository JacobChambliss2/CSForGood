import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
import json

# database setup
user = "chscscom_jacob"
password = "Jacoshark11"
host = "mi3-cl8-its1.a2hosting.com"
port = 3306
db = "chscscom_tutortrack"

engine = create_engine(f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db}")
# Initialize empty lists for each column
firstname = []
lastname = []
ages = []
schools = []
sats = []
distances = []
subjects = []
pics = []

df = pd.read_sql("SELECT * FROM tutors", engine)
#columns = age, school, sat, distance, subject

# Loop through the DataFrame rows and append to the lists
for index, row in df.iterrows():
    firstname.append(row['first_name'])
    lastname.append(row['last_name'])
    ages.append(row['age'])
    schools.append(row['school'])
    sats.append(row['sat_score'])
    distances.append(row['distance'])
    subjects.append(row['subject'])

names = [f"{first} {last}" for first, last in zip(firstname, lastname)]
# Save the lists into a dictionary
data = {
    "names": names,
    "ages": ages,
    "schools": schools,
    "sats": sats,
    "distances": distances,
    "subjects": subjects
}

# Write the dictionary to a JSON file
with open('data.json', 'w') as json_file:
    json.dump(data, json_file)