from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from .models import Midfielder, Forward, Defender, Goalkeeper
@api_view(['GET'])
@csrf_exempt
def get_defenders_with_nation(request):
    defenders = Defender.objects.all()
    players_with_data = [
        {"name": defender.Player, "season": "2024/25", "Nation": defender.Nation} 
        for defender in defenders
    ]
    return JsonResponse({"players": players_with_data})