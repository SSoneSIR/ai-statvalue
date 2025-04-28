from django.urls import path, include
from django.contrib import admin
from authentication.views import home 
from comparison.views import get_midfielders, get_forwards, get_defenders, get_goalkeepers, get_similar_players
from pred.views import search_players, generate_prediction, player_history
from django.views.decorators.csrf import csrf_exempt
urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path("", home, name="home"),  
    path('api/', include('comparison.urls')),
    path('api/', include('pred.urls')),
]
