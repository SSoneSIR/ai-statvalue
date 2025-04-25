from django.urls import path
from . import views

urlpatterns = [  
    path('players/', views.search_players, name='search_players'),  
    path('predict/', views.generate_prediction, name='generate_prediction'),

    # path('api/players/', views.get_players, name='player-list'),
    # path('api/predict/', views.predict_market_value, name='predict'),
]   