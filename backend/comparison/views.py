from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import json
import numpy as np
from .models import Midfielders, Forwards, Defenders, Goalkeepers

def get_model_for_position(position):
    model_map = {
        'midfielder': Midfielders,
        'forward': Forwards,
        'defender': Defenders,
        'goalkeeper': Goalkeepers,
    }
    return model_map.get(position.lower())

def get_relevant_stats(position):
    stats_map = {
        'defender': ["aerwon_percentage", "tklwon", "clr", "blksh", "int", "pasmedcmp", "pasmedcmp_percentage"],
        'forward': ["goals", "sot", "sot_percentage", "scash", "touattpen", "assists", "sca"],
        'goalkeeper': ["pastotcmp_percentage", "pastotcmp", "err", "save_percentage", "sweeper_actions", "pas3rd"],
        'midfielder': ["recov", "pastotcmp", "pastotcmp_percentage", "pasprog", "tklmid3rd", "carprog", "int"],
    }
    
    # Map Django model field names to API response field names
    field_map = {
        'goals': 'goals',
        'sot': 'sot',
        'sot_percentage': 'sot%',
        'scash': 'scash',
        'touattpen': 'touattpen',
        'assists': 'assists',
        'sca': 'sca',
        'aerwon_percentage': 'aerwon%',
        'pasmedcmp_percentage': 'pasmedcmp%',
        'pastotcmp_percentage': 'pastotcmp%',
        'save_percentage': 'save %'
    }
    
    stats = stats_map.get(position.lower(), [])
    
    # Return both model field names and API response field names
    return [(stat, field_map.get(stat, stat)) for stat in stats]

def normalize_stats(players_data, position):
    """
    Normalize player statistics on server side to scale from 0-100
    """
    # Get relevant stats for the position
    relevant_stats = [stat_tuple[0] for stat_tuple in get_relevant_stats(position)]
    
    # Extract stats for normalization
    stats_arrays = {}
    for stat in relevant_stats:
        stats_arrays[stat] = [getattr(player, stat, 0) if getattr(player, stat) is not None else 0 for player in players_data]
    
    # Create normalized data structure
    normalized_players = []
    
    for i, player in enumerate(players_data):
        normalized_stats = {}
        
        for stat in relevant_stats:
            values = stats_arrays[stat]
            max_value = max(values) if max(values) > 0 else 1
            
            # Normalize to 0-100 scale
            normalized_value = (getattr(player, stat, 0) if getattr(player, stat) is not None else 0) / max_value * 100
            normalized_stats[stat] = normalized_value
            
        normalized_players.append(normalized_stats)
    
    return normalized_players

@api_view(['GET'])
@csrf_exempt
@permission_classes([AllowAny])
def get_players_by_position(request, position):
    """Generic function to get players by position"""
    position = position.rstrip('s')  # Remove trailing 's' if present
    model_class = get_model_for_position(position)
    
    if not model_class:
        return JsonResponse({"error": f"Invalid position: {position}"}, status=400)
    
    try:
        players = model_class.objects.all()
        
        players_with_data = []
        for player in players:
            player_data = {
                "name": player.player,
                "Nation": player.nation,
                "Squad": player.squad,
                "Comp": player.comp,
                "Age": player.age,
                "Born": player.born,
                "MP": player.mp,
                "Starts": player.starts,
                "Min": player.min,
                "NinetyS": player.ninety_s
            }
            players_with_data.append(player_data)
        
        return JsonResponse({"players": players_with_data})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def compare_players(request):
    try:
        data = json.loads(request.body)
        player_names = data.get('players', [])
        position = data.get('position', '')
        
        if not player_names or not position:
            return JsonResponse({"error": "Missing required parameters"}, status=400)
            
        model_class = get_model_for_position(position)
        if not model_class:
            return JsonResponse({"error": f"Invalid position: {position}"}, status=400)
            
        relevant_stats = get_relevant_stats(position)
        
        # Retrieve all players at once for better efficiency
        players_data = []
        for player_name in player_names:
            try:
                player = model_class.objects.get(player=player_name)
                players_data.append(player)
            except model_class.DoesNotExist:
                return JsonResponse({"error": f"Player not found: {player_name}"}, status=404)
            
        # Perform server-side normalization
        normalized_stats = normalize_stats(players_data, position)
        
        results = []
        for i, player in enumerate(players_data):
            stats_data = {}
            normalized_data = {}
            
            # Add each stat to the response with model field to API field name conversion
            for j, (model_field, api_field) in enumerate(relevant_stats):
                value = getattr(player, model_field, 0)
                if value is None:
                    value = 0
                stats_data[api_field] = value
                
                # Add normalized value
                normalized_data[api_field] = normalized_stats[i].get(model_field, 0)
            
            # Create player object with basic info
            player_data = {
                "name": player.player,
                "Nation": player.nation,
                "Squad": player.squad,
                "Comp": player.comp,
                "Age": player.age,
                "Born": player.born,
                "MP": player.mp,
                "Starts": player.starts,
                "Min": player.min,
                "NinetyS": player.ninety_s
            }
            
            results.append({
                "player": player_data,
                "stats": stats_data,
                "normalizedStats": normalized_data
            })
        
        return JsonResponse(results, safe=False)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['GET'])
@csrf_exempt
@permission_classes([AllowAny])
def get_defenders(request):
    return get_players_by_position(request, 'defender')

@api_view(['GET'])
@csrf_exempt
@permission_classes([AllowAny])
def get_midfielders(request):
    return get_players_by_position(request, 'midfielder')

@api_view(['GET'])
@csrf_exempt
@permission_classes([AllowAny])
def get_forwards(request):
    return get_players_by_position(request, 'forward')

@api_view(['GET'])
@csrf_exempt
@permission_classes([AllowAny])
def get_goalkeepers(request):
    return get_players_by_position(request, 'goalkeeper')

# New functions for player search and UI-based comparison

@api_view(['GET'])
@permission_classes([AllowAny])
def search_players(request):
    """
    View to search for players across all position collections.
    Returns player name, squad and nation as search results.
    """
    query = request.GET.get('query', '')
    if not query or len(query) < 2:
        return JsonResponse({'results': []})
    
    # Search players across all position collections
    midfielders = Midfielders.objects.filter(player__icontains=query)[:10]
    forwards = Forwards.objects.filter(player__icontains=query)[:10]
    defenders = Defenders.objects.filter(player__icontains=query)[:10]
    goalkeepers = Goalkeepers.objects.filter(player__icontains=query)[:10]
    
    results = []
    
    # Process midfielders
    for player in midfielders:
        results.append({
            'name': player.player,
            'squad': player.squad,
            'nation': player.nation,
            'position': 'midfielder',
            'id': str(player.id)
        })
    
    # Process forwards
    for player in forwards:
        results.append({
            'name': player.player,
            'squad': player.squad,
            'nation': player.nation,
            'position': 'forward',
            'id': str(player.id)
        })
    
    # Process defenders
    for player in defenders:
        results.append({
            'name': player.player,
            'squad': player.squad,
            'nation': player.nation,
            'position': 'defender',
            'id': str(player.id)
        })
    
    # Process goalkeepers
    for player in goalkeepers:
        results.append({
            'name': player.player,
            'squad': player.squad,
            'nation': player.nation,
            'position': 'goalkeeper',
            'id': str(player.id)
        })
    
    return JsonResponse({'results': results})

@api_view(['GET'])
@permission_classes([AllowAny])
def player_detail(request, position, player_id):
    """
    View to get detailed stats for a specific player.
    """
    try:
        model_class = get_model_for_position(position)
        if not model_class:
            return JsonResponse({"error": f"Invalid position: {position}"}, status=400)
            
        player = model_class.objects.get(id=player_id)
        relevant_stats = get_relevant_stats(position)
        
        # Get stats based on position
        stats_data = {}
        for model_field, api_field in relevant_stats:
            value = getattr(player, model_field, 0)
            if value is None:
                value = 0
            stats_data[api_field] = value
        
        # Create player object with basic info
        player_data = {
            "name": player.player,
            "nation": player.nation,
            "squad": player.squad,
            "comp": player.comp,
            "age": player.age,
            "born": player.born.strftime('%Y-%m-%d') if player.born else None,
            "mp": player.mp,
            "starts": player.starts,
            "min": player.min,
            "ninety_s": player.ninety_s,
            "position": position,
            "stats": stats_data
        }
        
        return JsonResponse(player_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def compare_players_ui(request):
    """
    View to compare two players with radar chart data.
    For UI-based comparison.
    """
    player1_position = request.GET.get('player1_position')
    player1_id = request.GET.get('player1_id')
    player2_position = request.GET.get('player2_position')
    player2_id = request.GET.get('player2_id')
    
    if not all([player1_position, player1_id, player2_position, player2_id]):
        return JsonResponse({'error': 'Missing required parameters'}, status=400)
    
    try:
        # Get player 1 model and data
        model1 = get_model_for_position(player1_position)
        if not model1:
            return JsonResponse({"error": f"Invalid position: {player1_position}"}, status=400)
        player1 = model1.objects.get(id=player1_id)
        
        # Get player 2 model and data
        model2 = get_model_for_position(player2_position)
        if not model2:
            return JsonResponse({"error": f"Invalid position: {player2_position}"}, status=400)
        player2 = model2.objects.get(id=player2_id)
        
        # For radar chart, we need to map position-specific stats to common radar axes
        # We'll use a simplified approach for visualization
        
        # Get relevant stats for each player
        stats1 = get_relevant_stats(player1_position)
        stats2 = get_relevant_stats(player2_position)
        
        # Get radar axes (use position-specific radar axes)
        radar_axes = get_radar_axes(player1_position)
        
        # Map player stats to radar axes
        player1_radar_data = map_stats_to_radar(player1, stats1, player1_position)
        player2_radar_data = map_stats_to_radar(player2, stats2, player2_position)
        
        # Normalize radar data for both players together
        normalized_radar_data = normalize_radar_data(player1_radar_data, player2_radar_data)
        
        result = {
            'player1': {
                'name': player1.player,
                'squad': player1.squad,
                'nation': player1.nation,
                'position': player1_position,
                'radarData': normalized_radar_data['player1']
            },
            'player2': {
                'name': player2.player,
                'squad': player2.squad,
                'nation': player2.nation,
                'position': player2_position,
                'radarData': normalized_radar_data['player2']
            },
            'axes': radar_axes
        }
        
        return JsonResponse(result)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=404)

def get_radar_axes(position):
    """
    Returns the appropriate axes for radar chart based on position.
    """
    # Standard radar axes for different positions
    axes_map = {
        'midfielder': [
            'Short%', 'Short-stopping', 'Deflections',
            'Aerial', 'Exits', 'Passes', 'Long%'
        ],
        'forward': [
            'Finishing', 'Dribbling', 'First Touch', 
            'Movement', 'Passing', 'Decision Making', 'Work Rate'
        ],
        'defender': [
            'Aerial', 'Tackling', 'Marking',
            'Positioning', 'Passing', 'Interceptions', 'Clearances'
        ],
        'goalkeeper': [
            'Shot-stopping', 'Aerial Command', 'Distribution',
            'Sweeping', 'Positioning', 'Handling', 'Reflexes'
        ]
    }
    
    return axes_map.get(position.lower(), [])

def map_stats_to_radar(player, stats, position):
    """
    Maps player stats to radar chart axes.
    """
    radar_data = {}
    
    if position == 'midfielder':
        radar_data = {
            'Short%': getattr(player, 'pastotcmp_percentage', 0),
            'Short-stopping': getattr(player, 'tklmid3rd', 0),
            'Deflections': getattr(player, 'int', 0),
            'Aerial': 50,  # Placeholder
            'Exits': getattr(player, 'carprog', 0),
            'Passes': getattr(player, 'pasprog', 0),
            'Long%': getattr(player, 'pastotcmp', 0)
        }
    elif position == 'forward':
        radar_data = {
            'Finishing': getattr(player, 'goals', 0),
            'Dribbling': getattr(player, 'touattpen', 0),
            'First Touch': getattr(player, 'sca', 0),
            'Movement': getattr(player, 'scash', 0),
            'Passing': getattr(player, 'assists', 0),
            'Decision Making': getattr(player, 'sot_percentage', 0),
            'Work Rate': getattr(player, 'sot', 0)
        }
    elif position == 'defender':
        radar_data = {
            'Aerial': getattr(player, 'aerwon_percentage', 0),
            'Tackling': getattr(player, 'tklwon', 0),
            'Marking': getattr(player, 'blksh', 0),
            'Positioning': getattr(player, 'int', 0),
            'Passing': getattr(player, 'pasmedcmp_percentage', 0),
            'Interceptions': getattr(player, 'int', 0),
            'Clearances': getattr(player, 'clr', 0)
        }
    elif position == 'goalkeeper':
        radar_data = {
            'Shot-stopping': getattr(player, 'save_percentage', 0),
            'Aerial Command': 50,  # Placeholder
            'Distribution': getattr(player, 'pastotcmp_percentage', 0),
            'Sweeping': getattr(player, 'sweeper_actions', 0),
            'Positioning': 100 - getattr(player, 'err', 0) * 10,  # Inverted error stat
            'Handling': getattr(player, 'pastotcmp', 0),
            'Reflexes': getattr(player, 'pas3rd', 0) * 10
        }
        
    return radar_data

def normalize_radar_data(player1_data, player2_data):
    """
    Normalize radar data for visualization.
    """
    normalized_data = {
        'player1': {},
        'player2': {}
    }
    
    # Get all axes
    all_axes = list(set(list(player1_data.keys()) + list(player2_data.keys())))
    
    for axis in all_axes:
        p1_value = player1_data.get(axis, 0)
        p2_value = player2_data.get(axis, 0)
        
        # Find max value for normalization
        max_value = max(p1_value, p2_value)
        if max_value == 0:
            max_value = 1  # Prevent division by zero
            
        # Normalize to 0-100 scale
        normalized_data['player1'][axis] = min(100, (p1_value / max_value * 100))
        normalized_data['player2'][axis] = min(100, (p2_value / max_value * 100))
    
    return normalized_data

def player_search_page(request):
    """
    Renders the player search page.
    """
    return render(request, 'player_search.html')

def player_comparison_page(request):
    """
    Renders the player comparison page.
    """
    player1_id = request.GET.get('player1_id')
    player1_position = request.GET.get('player1_position')
    player2_id = request.GET.get('player2_id')
    player2_position = request.GET.get('player2_position')
    
    context = {
        'player1_id': player1_id,
        'player1_position': player1_position,
        'player2_id': player2_id,
        'player2_position': player2_position
    }
    
    return render(request, 'player_comparison.html', context)