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

@csrf_exempt
def compare_players(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        position = body.get('position')
        players = body.get('players', [])

        if not position or len(players) != 2:
            return JsonResponse({'error': 'Position and two players must be specified.'}, status=400)

        Model = {
            'defender': Defenders,
            'forward': Forwards,
            'midfielder': Midfielders,
            'goalkeeper': Goalkeepers,
        }.get(position.lower())

        if not Model:
            return JsonResponse({'error': 'Invalid position.'}, status=400)

        try:
            player1 = Model.objects.get(player=players[0])
            player2 = Model.objects.get(player=players[1])
        except Model.DoesNotExist:
            return JsonResponse({'error': 'One or both players not found.'}, status=404)

        radar1 = map_stats_to_radar(player1, position)
        radar2 = map_stats_to_radar(player2, position)

        return JsonResponse({
            'player1': {'name': player1.player, 'radar': radar1},
            'player2': {'name': player2.player, 'radar': radar2},
        })
    else:
        return JsonResponse({'error': 'POST method required.'}, status=405)


def map_stats_to_radar(player, position):
    if position == 'defender':
        radar_data = {
            'Defensive Actions': getattr(player, 'tklplusint', 0),
            'Interceptions': getattr(player, 'interceptions', 0),
            'Clearances': getattr(player, 'clearances', 0),
            'Aerial Duels Won': getattr(player, 'aerials_won', 0),
            'Tackles': getattr(player, 'tackles', 0),
            'Blocks': getattr(player, 'blocks', 0),
            'Passing Accuracy': getattr(player, 'pastotcmp_percentage', 0)
        }

    elif position == 'midfielder':
        radar_data = {
            'Passing Accuracy': getattr(player, 'pastotcmp_percentage', 0),
            'Key Passes': getattr(player, 'key_passes', 0),
            'Tackles': getattr(player, 'tackles', 0),
            'Dribbles': getattr(player, 'dribbles', 0),
            'Long Balls': getattr(player, 'long_balls', 0),
            'Duels Won': getattr(player, 'duels_won', 0),
            'Goals': getattr(player, 'goals', 0)
        }

    elif position == 'forward':
        radar_data = {
            'Goals': getattr(player, 'goals', 0),
            'Shots on Target': getattr(player, 'shots_on_target', 0),
            'Dribbles': getattr(player, 'dribbles', 0),
            'Assists': getattr(player, 'assists', 0),
            'Key Passes': getattr(player, 'key_passes', 0),
            'Aerial Duels': getattr(player, 'aerials_won', 0),
            'Offsides': getattr(player, 'offsides', 0)
        }

    elif position == 'goalkeeper':
        radar_data = {
            'Shot-stopping': getattr(player, 'save_percentage', 0),
            'Aerial Command': 50,  # Replace with actual if available
            'Distribution': getattr(player, 'pastotcmp_percentage', 0),
            'Sweeping': getattr(player, 'sweeper_actions', 0),
            'Positioning': getattr(player, 'err', 0),
            'Handling': getattr(player, 'pas3rd', 0),
            'Reflexes': getattr(player, 'pastotcmp', 0)
        }

    else:
        radar_data = {}

    return radar_data

from django.http import JsonResponse
from rest_framework.decorators import api_view
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
def get_similar_players(request):
    try:
        # Get data from the request
        data = request.data
        player_data = data.get('player')
        position = data.get('position').lower()  # forward, defender, midfielder, goalkeeper
        
        if not player_data or not position:
            return JsonResponse({'error': 'Player data and position are required'}, status=400)
        
        print(f"Received request for similar players to {player_data.get('name')} who is a {position}")
        
        # Map position to model and features
        position_model_map = {
            'forward': (Forwards, ['goals', 'sot', 'sot_percentage', 'scash', 'touattpen', 'assists', 'sca']),
            'defender': (Defenders, ['aerwon_percentage', 'tklwon', 'clr', 'blksh', 'int', 'pasmedcmp', 'pasmedcmp_percentage']),
            'midfielder': (Midfielders, ['recov', 'pastotcmp', 'pastotcmp_percentage', 'pasprog', 'tklmid3rd', 'carprog', 'int']),
            'goalkeeper': (Goalkeepers, ['pastotcmp_percentage', 'pastotcmp', 'err', 'save_percentage', 'sweeper_actions', 'pas3rd'])
        }
        
        if position not in position_model_map:
            return JsonResponse({'error': f"Invalid position: {position}"}, status=400)
            
        Model, features = position_model_map[position]
        
        # Fetch all players of this position
        all_players = list(Model.objects.all())
        
        # Find the reference player by name
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
            
        # Calculate distances manually without KNN model
        # First, get the reference player's stats
        reference_stats = []
        for feature in features:
            # Convert feature names from camelCase to snake_case for database field access
            db_field = feature.lower()
            
            # Special case for percentage fields that might have different names
            if feature.endswith('Perc'):
                db_field = feature.lower().replace('perc', '_percentage')
                
            value = getattr(reference_player, db_field, 0)
            if value is None:
                value = 0
            reference_stats.append(float(value))
        
        # Calculate "distance" from reference player to all other players
        similar_players_data = []
        
        for player in all_players:
            # Skip the reference player itself
            if player.player.lower() == player_name.lower():
                continue
                
            # Get this player's stats
            player_stats = []
            for feature in features:
                # Convert feature names to match database fields
                db_field = feature.lower()
                
                # Special case for percentage fields
                if feature.endswith('Perc'):
                    db_field = feature.lower().replace('perc', '_percentage')
                    
                value = getattr(player, db_field, 0)
                if value is None:
                    value = 0
                player_stats.append(float(value))
            
            # Calculate Euclidean distance
            squared_diff_sum = sum((a - b) ** 2 for a, b in zip(reference_stats, player_stats))
            distance = squared_diff_sum ** 0.5
            
            # Create player data object
            player_data = {
                'name': player.player,
                'stats': {},
                'distance': distance
            }
            
            # Fill in stats dictionary
            for i, feature in enumerate(features):
                player_data['stats'][feature] = player_stats[i]
                
            similar_players_data.append(player_data)
        
        # Sort by similarity (lower distance means more similar)
        similar_players_data.sort(key=lambda x: x['distance'])
        
        # Return top 5 most similar players
        return JsonResponse({'similar_players': similar_players_data[:5]}, status=200)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=400)
    