from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from django.urls import path
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import requests
import json
from django.contrib.auth import get_user_model
User = get_user_model()
def home(request):
    return HttpResponse("Welcome to the home page")

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            data = request.data
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            confirm_password = data.get('confirm_password')

            if password != confirm_password:
                return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(username=username).exists():
                return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=email).exists():
                return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

            user = serializer.save()
            
            # Generate token
            refresh = RefreshToken.for_user(user)
            token = str(refresh.access_token)
            
            return Response({
                "message": "Registration successful",
                "user": UserSerializer(user).data,
                "token": token
            }, status=status.HTTP_201_CREATED)
        
        # Return validation errors
        return Response({
            "message": "Registration failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            user = authenticate(username=username, password=password)
            
            if user:
                refresh = RefreshToken.for_user(user)
                token = str(refresh.access_token)
                
                return Response({
                    "message": "Login successful",
                    "user": UserSerializer(user).data,
                    "token": token
                }, status=status.HTTP_200_OK)
            
            return Response({
                "message": "Invalid  username or password"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({
            "message": "Login failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


