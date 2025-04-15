# load_stats.py
import pandas as pd
from api.models import PlayerStat

def load_excel_data(file_path):
    df = pd.read_excel(file_path)

    for _, row in df.iterrows():
        PlayerStat.objects.create(
            name=row['Player'],
            position=row['Pos'],
            goals=row['Goals'],
            assists=row['Assists'],
            shots_on_target=row['SoT'],
            pass_completion=row['PasTotCmp%'],
            tackles_won=row['TklWon'],
            saves=row['Save%']
        )

    print("Player stats loaded successfully!")
