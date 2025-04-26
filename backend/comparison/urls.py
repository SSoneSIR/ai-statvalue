from django.urls import path
from . import views

urlpatterns = [
    # API endpoints for listing players by position
    path('defenders/', views.get_defenders, name='get_defenders'),
    path('midfielders/', views.get_midfielders, name='get_midfielders'),
    path('forwards/', views.get_forwards, name='get_forwards'),
    path('goalkeepers/', views.get_goalkeepers, name='get_goalkeepers'),
    path('similar_players/', views.get_similar_players, name='get_similar_players'),        
]