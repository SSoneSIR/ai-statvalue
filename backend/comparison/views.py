from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from .models import Midfielder, Forward, Defender, Goalkeeper
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from django.core.mail import send_mail
import json
@api_view(['GET'])
@csrf_exempt
def get_defenders(request):
    defenders = Defender.objects.all()
    players_with_data = [
        {"name": defender.Player, "season": "2024/25", "Nation": defender.Nation} 
        for defender in defenders
    ]
    return JsonResponse({"players": players_with_data})

def get_midfielders(request):
    midfielders = Midfielder.objects.all()
    players_with_data = [
        {"name": midfielder.Player, "season": "2024/25", "Nation": midfielder.Nation} 
        for midfielder in midfielders
    ]
    return JsonResponse({"players": players_with_data})

def get_forwards(request):
    forwards = Forward.objects.all()
    players_with_data = [
        {"name": forward.Player, "season": "2024/25", "Nation": forward.Nation} 
        for forward in forwards
    ]
    return JsonResponse({"players": players_with_data})

def get_goalkeepers(request):
    goalkeepers = Goalkeeper.objects.all()
    players_with_data = [
        {"name": goalkeeper.Player, "season": "2024/25", "Nation": goalkeeper.Nation} 
        for goalkeeper in goalkeepers
    ]
    return JsonResponse({"players": players_with_data}) 

