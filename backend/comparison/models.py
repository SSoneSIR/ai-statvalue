from django.db import models

class Midfielder(models.Model):
    Player = models.CharField(max_length=100)
    Nation = models.CharField(max_length=100)
    # Add other fields as necessary
    
    db_table = 'midfielders'  # Specify the table name if needed
    
    def __str__(self):
        return self.Midfielder

class Forward(models.Model):
    Player = models.CharField(max_length=100)
    Nation = models.CharField(max_length=100)
    # Add other fields as necessary
    
    db_table = 'forwards'  # Specify the table name if needed
    
    def __str__(self):
        return self.Forward
    
class Defender(models.Model):
    Player = models.CharField(max_length=100)
    Nation = models.CharField(max_length=100)
    # Add other fields as necessary
    
    db_table = 'defenders'  # Specify the table name if needed
    
    def __str__(self):
        return self.Defender

class Goalkeeper(models.Model):
    Player = models.CharField(max_length=100)
    Nation = models.CharField(max_length=100)
    # Add other fields as necessary
    
    db_table = 'goalkeepers'  # Specify the table name if needed
    
    def __str__(self):
        return self.Goalkeeper
    

# Create your models here.
