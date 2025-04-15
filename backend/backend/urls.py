from django.urls import path, include
from django.contrib import admin
from authentication.views import home  
from authentication.views import check_admin_status  

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("authentication.urls")),
    path("", home, name="home"),  # Add this line
    path('api/auth/check-admin', check_admin_status),
]
