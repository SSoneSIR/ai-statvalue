from django.urls import path
from . import views

urlpatterns = [
    path('api/comp/midfielders/', views.get_midfielders, name='midfielders'),
    path('api/comp/forwards/', views.get_forwards, name='forwards'),
    path('api/comp/defenders/', views.get_defenders, name='defenders'),
    path('api/comp/goalkeepers/', views.get_goalkeepers, name='goalkeepers'),
]