from django.http import JsonResponse
from .models import Defenders, Forwards, Midfielders, Goalkeepers
from django.views.decorators.csrf import csrf_exempt
import json

def get_defenders(request):
    defenders = Defenders.objects.all()
    data = [{'name': d.player,
             'Nation': d.nation,
             'Pos': d.position,
             'Squad': d.squad,
             'Comp': d.comp,
             'Age': d.age,	
             'Born': d.born,
             'MP': d.mp,
             'Starts': d.starts,
             'Min': d.min,
             'NinetyS': d.ninety_s,  
             'AerWonPerc': d.aerwon_percentage,
             'TklWon': d.tklwon,
             'Clr': d.clr,
             'BlkSh': d.blksh,
             'Int': d.int,
             'PasMedCmp': d.pasmedcmp,
            'PasMedCmpPerc': d.pasmedcmp_percentage
             } for d in defenders]   
    return JsonResponse(data, safe=False)

def get_forwards(request):
    forwards = Forwards.objects.all()
    data = [{'name': f.player,
             'Nation': f.nation,
             'Pos': f.position,
             'Squad': f.squad,
             'Comp': f.comp,
             'Age': f.age,
             'Born': f.born,
             'MP': f.mp,
             'Starts': f.starts,
             'Min': f.min,
             'NinetyS': f.ninety_s,
             'Goals': f.goals,
             'SoT': f.sot,
             'SoTPerc': f.sot_percentage,
             'ScaSh': f.scash,
             'TouAttPen': f.touattpen,
             'Assists': f.assists,
             'Sca': f.sca
                } for f in forwards]
    return JsonResponse(data, safe=False)

def get_midfielders(request):
    midfielders = Midfielders.objects.all()
    data = [{'name': m.player,
             'Nation': m.nation,
             'Pos': m.position,
             'Squad': m.squad,
             'Comp': m.comp,
             'Age': m.age,
             'Born': m.born,
             'MP': m.mp,
             'Starts': m.starts,
             'Min': m.min,
             'NinetyS': m.ninety_s,
             'Recovery':m.recov,
             'PasTotCmp':m.pastotcmp,
             'PasTotCmp_percentage':m.pastotcmp_percentage,
             'PasProg':m.pasprog,
             'TklMid3rd':m.tklmid3rd,
             'CarProg':m.carprog,
             'Int':m.int
             } for m in midfielders]
    
    return JsonResponse(data, safe=False)

def get_goalkeepers(request):
    goalkeepers = Goalkeepers.objects.all()
    data = [{'name': g.player,
             'Nation': g.nation,
             'Pos': g.position,
             'Squad': g.squad,
             'Comp': g.comp,
             'Age': g.age,
             'Born': g.born,
             'MP': g.mp,
             'Starts': g.starts,
             'Min': g.min,
             'NinetyS': g.ninety_s,
             'PasTotCmpPerc': g.pastotcmp_percentage, 
             'PasTotCmp': g.pastotcmp,   
             'Err': g.err,
             'SavePerc': g.save_percentage,
             'SweeperActions': g.sweeper_actions,
             'Pas3rd': g.pas3rd,
             } for g in goalkeepers]  

    return JsonResponse(data, safe=False)



from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from sklearn.neighbors import NearestNeighbors
import joblib
import pandas as pd
from sklearn.preprocessing import StandardScaler
from .models import Defenders, Forwards, Midfielders, Goalkeepers

def load_knn_model(position):
    knn = joblib.load(f"knn_model_{position}.pkl")
    scaler = joblib.load(f"scaler_{position}.pkl")
    return knn, scaler

@api_view(['POST'])
@permission_classes([AllowAny])
def get_similar_players(request):
    try:
        data = request.data
        player_data = data.get('player')
        position = data.get('position').lower() 
        if not player_data or not position:
            return JsonResponse({'error': 'Player data and position are required'}, status=400)
        print(f"Received request for similar players to {player_data.get('name')} who is a {position}")
        position_model_map = {
            'forward': (Forwards, ['goals', 'sot', 'sot_percentage', 'scash', 'touattpen', 'assists', 'sca']),
            'defender': (Defenders, ['aerwon_percentage', 'tklwon', 'clr', 'blksh', 'int', 'pasmedcmp', 'pasmedcmp_percentage']),
            'midfielder': (Midfielders, ['recov', 'pastotcmp', 'pastotcmp_percentage', 'pasprog', 'tklmid3rd', 'carprog', 'int']),
            'goalkeeper': (Goalkeepers, ['pastotcmp_percentage', 'pastotcmp', 'err', 'save_percentage', 'sweeper_actions', 'pas3rd'])
        }
        if position not in position_model_map:
            return JsonResponse({'error': f"Invalid position: {position}"}, status=400)   
        Model, features = position_model_map[position]
        all_players = list(Model.objects.all())
        player_name = player_data.get('name')
        reference_player = None
        for player in all_players:
            if player.player.lower() == player_name.lower():
                reference_player = player
                break
        if not reference_player:
            return JsonResponse(
                {'error': f"Player {player_name} not found in {position}s database"}, 
                status=404
            )
        reference_stats = []
        for feature in features:
            db_field = feature.lower()            
            if feature.endswith('Perc'):
                db_field = feature.lower().replace('perc', '_percentage')
            value = getattr(reference_player, db_field, 0)
            if value is None:
                value = 0
            reference_stats.append(float(value))        
        similar_players_data = []
        for player in all_players:
            if player.player.lower() == player_name.lower():
                continue
            player_stats = []
            for feature in features:
                db_field = feature.lower()
                if feature.endswith('Perc'):
                    db_field = feature.lower().replace('perc', '_percentage')
                value = getattr(player, db_field, 0)
                if value is None:
                    value = 0
                player_stats.append(float(value))
            squared_diff_sum = sum((a - b) ** 2 for a, b in zip(reference_stats, player_stats))
            distance = squared_diff_sum ** 0.5
            player_data = {
                'name': player.player,
                'stats': {},
                'distance': distance
            }
            for i, feature in enumerate(features):
                player_data['stats'][feature] = player_stats[i]   
            similar_players_data.append(player_data)
        similar_players_data.sort(key=lambda x: x['distance'])
        return JsonResponse({'similar_players': similar_players_data[:5]}, status=200)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=400)
    