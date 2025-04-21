import os
import django
import numpy as np
import pandas as pd
import joblib

from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "statvalue_backend.settings")  # Replace with your Django settings path
django.setup()

# Import your models
from comparison.models import Defenders, Forwards, Midfielders, Goalkeepers  # Replace with your app name

# Choose a position to train KNN
position = 'goalkeeper'  # Change this to defender, midfielder, goalkeeper

# Map position to model and features
position_model_map = {
    'forward': (Forwards, ['goals', 'sot', 'assists', 'scash', 'touattpen']),
    'defender': (Defenders, ['tklwon', 'clr', 'blksh', 'int', 'aerwon_percentage']),
    'midfielder': (Midfielders, ['recov', 'pastotcmp', 'pasprog', 'tklmid3rd', 'carprog']),
    'goalkeeper': (Goalkeepers, ['save_percentage', 'err', 'sweeper_actions', 'pastotcmp', 'pas3rd'])
}

Model, features = position_model_map[position]

# Query the data
qs = Model.objects.all()
df = pd.DataFrame(list(qs.values()))

# Check if required features exist
if not all(f in df.columns for f in features):
    raise ValueError("Some required features are missing from the database.")

# Drop rows with missing values
df = df.dropna(subset=features + ['player'])

# Normalize
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df[features])

# Fit KNN
knn = NearestNeighbors(n_neighbors=5)
knn.fit(X_scaled)

# Save both the model and scaler using joblib
joblib.dump(knn, f"knn_model_{position}.pkl")
joblib.dump(scaler, f"scaler_{position}.pkl")

print(f"KNN model and scaler saved for position: {position}")
