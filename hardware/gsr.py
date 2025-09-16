import pandas as pd

# Load the dataset
df = pd.read_csv("mental_health_wearable_data.csv")

# Inspect the first few rows
print(df.head())

# Check what columns are available
print(df.columns)

# Select the columns relevant to your wearable emotion recognition
# - Timestamp: for time series
# - GSR_Values: your main sensor input
# - Preprocessed_Features: might include heartbeat/HRV
# - Emotional_State: target
columns_to_use = ["Timestamp", "GSR_Values", "Preprocessed_Features", "Emotional_State"]

# Check if all columns exist
columns_to_use = [col for col in columns_to_use if col in df.columns]

# Create a filtered dataframe
filtered_df = df[columns_to_use]

# Optional: split Preprocessed_Features into separate columns if it's a string of features
if "Preprocessed_Features" in filtered_df.columns:
    # Assuming features are comma-separated in the column
    preprocessed = filtered_df["Preprocessed_Features"].str.split(",", expand=True)
    # Rename columns as Heartbeat_1, Heartbeat_2, etc. (adjust as needed)
    preprocessed.columns = [f"Feature_{i+1}" for i in range(preprocessed.shape[1])]
    filtered_df = pd.concat([filtered_df.drop("Preprocessed_Features", axis=1), preprocessed], axis=1)

# Save the filtered dataset to a new CSV for training
filtered_df.to_csv("wearable_emotion_data.csv", index=False)

print("Filtered dataset saved as wearable_emotion_data.csv")
print(filtered_df.head())
