import json
from pathlib import Path

WEEK1_FILE = Path("outputs/week1_prediction.json")
WEEK2_FILE = Path("outputs/week2_prediction.json")


def load_prediction(file_path):
    with open(file_path, "r") as file:
        return json.load(file)


week1 = load_prediction(WEEK1_FILE)
week2 = load_prediction(WEEK2_FILE)

print("\n==============================")
print("SKIN PROGRESS REPORT")
print("==============================")

for concern in week1["probabilities"]:

    old_score = week1["probabilities"][concern]
    new_score = week2["probabilities"][concern]

    difference = old_score - new_score

    print(f"\n{concern.upper()}")
    print(f"Week 1 : {old_score:.2f}%")
    print(f"Week 2 : {new_score:.2f}%")

    if difference > 0:
        print(f"✅ Improved by {difference:.2f}%")

    elif difference < 0:
        print(f"⚠ Increased by {abs(difference):.2f}%")

    else:
        print("No Change")

print("\n==============================")