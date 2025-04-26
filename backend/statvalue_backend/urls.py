from django.urls import path, include
from django.contrib import admin
from authentication.views import home  
from comparison.views import get_midfielders, get_forwards, get_defenders, get_goalkeepers, get_similar_players
#from authentication.views import check_admin_status  

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path("", home, name="home"),  # Add this line
    #path('api/auth/check-admin', check_admin_status),
    path('api/', include('comparison.urls')),
    path('api/', include('pred.urls')),
]
