import pandas as pd
from pathlib import Path

# Dataset folder
dataset_path = Path(r"C:\Users\DELL\Downloads\archive")

# Get all CSV files automatically
csv_files = dataset_path.glob("*.csv")

for file in csv_files:

    print("\n" + "=" * 70)
    print(f"Exploring: {file.name}")
    print("=" * 70)

    try:
        df = pd.read_csv(file, low_memory=False)

        print(f"\nShape: {df.shape}")

        print("\nColumns:")
        print(df.columns.tolist())

        print("\nFirst 5 Rows:")
        print(df.head())

        print("\nMissing Values:")
        print(df.isnull().sum())

        print("\nData Types:")
        print(df.dtypes)

    except Exception as e:
        print(f"Error reading {file.name}")
        print(e)