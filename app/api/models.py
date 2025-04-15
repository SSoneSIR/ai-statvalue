# models.py
from django.db import models

class PlayerStat(models.Model):
    name = models.CharField(max_length=255)
    position = models.CharField(max_length=50)
    goals = models.IntegerField(null=True, blank=True)
    assists = models.IntegerField(null=True, blank=True)
    shots_on_target = models.IntegerField(null=True, blank=True)
    pass_completion = models.FloatField(null=True, blank=True)
    tackles_won = models.IntegerField(null=True, blank=True)
    saves = models.IntegerField(null=True, blank=True)
    # Add any other relevant fields
