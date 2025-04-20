from django.urls import path
from . import views

urlpatterns = [
    # API endpoints for listing players by position
    path('api/defenders/', views.get_defenders, name='get_defenders'),
    path('api/midfielders/', views.get_midfielders, name='get_midfielders'),
    path('api/forwards/', views.get_forwards, name='get_forwards'),
    path('api/goalkeepers/', views.get_goalkeepers, name='get_goalkeepers'),
    path('api/players/<str:position>/', views.get_players_by_position, name='get_players_by_position'),
    
    # API endpoint for player comparison
    path('api/compare/', views.compare_players, name='compare_players'),
    
    # Player search endpoints
    path('api/search/', views.search_players, name='search_players'),
    path('api/player/<str:position>/<str:player_id>/', views.player_detail, name='player_detail'),
    path('api/compare-ui/', views.compare_players_ui, name='compare_players_ui'),
    
    # Web UI pages
    path('search/', views.player_search_page, name='player_search_page'),
    path('compare/', views.player_comparison_page, name='player_comparison_page'),
    
    # Make search page the default landing page
    path('', views.player_search_page, name='index'),
]