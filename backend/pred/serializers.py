from rest_framework import serializers
from .models import PlayerStats

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerStats
        fields = ['id', 'name']