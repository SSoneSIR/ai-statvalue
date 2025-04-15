from rest_framework import status 
from rest_framework.response import Response  
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt

from .serializers import RegisterSerializer
from django.http import JsonResponse
from django.contrib.auth import authenticate

@csrf_exempt
@api_view(['POST'])
def register_user(request):
    if request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'User registered successfully'},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {'errors': serializer.errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        if user.is_staff:  # Check if user is admin
            return Response(
                {"message": "Admin login successful", "is_admin": True},
                status=status.HTTP_200_OK
            )
        return Response(
            {"message": "Login successful", "is_admin": False},
            status=status.HTTP_200_OK
        )
    else:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

def home(request):
    return JsonResponse({"message": "Welcome to StatValue AI Backend!"})


    
@api_view(['GET'])
def check_admin_status(request):
    if request.user.is_authenticated:
        return Response(
            {"is_admin": request.user.is_staff},
            status=status.HTTP_200_OK
        )
    return Response(
        {"is_admin": False},
        status=status.HTTP_401_UNAUTHORIZED
    )