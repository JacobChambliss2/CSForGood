import csv

# Initialize empty lists for each column
names = []
ages = []
schools = []
sats = []
actives = []

# Open and read the CSV file
with open('' \
'rank/example.csv', 'r') as file:
    reader = csv.DictReader(file)  # Use DictReader to handle column headers
    for row in reader:
        # Append each value to its respective list
        names.append(row['Name'])
        ages.append(int(row['Age']))
        schools.append(row['School'])
        sats.append(int(row['SAT']))
        actives.append(row['Active'] == 'True')  # Convert 'True'/'False' to boolean

for i in range(len(names)):
    print(f"Name: {names[i]}, Age: {ages[i]}, School: {schools[i]}, SAT: {sats[i]}, Active: {actives[i]}")

import json

# Save the lists into a dictionary
data = {
    "names": names,
    "ages": ages,
    "schools": schools,
    "sats": sats,
    "actives": actives
}

# Write the dictionary to a JSON file
with open('data.json', 'w') as json_file:
    json.dump(data, json_file)