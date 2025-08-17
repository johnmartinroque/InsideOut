import kagglehub
import pandas as pd
from kagglehub import KaggleDatasetAdapter

df = kagglehub.load_dataset(
    KaggleDatasetAdapter.PANDAS,
    "danielfesalbon/young-adults-affective-data-ecg-and-gsr-signals",
    "data/GSR.csv",  # <- this is the correct file from the dataset
)

print("First 5 records:")
print(df.head())
print("\nColumns:", df.columns)