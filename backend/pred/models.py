from djongo import models

class PlayerStats(models.Model):
    _id = models.ObjectIdField()
    player_id = models.IntegerField()
    name = models.CharField(max_length=100)
    MV = models.FloatField()
    Nation = models.CharField(max_length=50)
    Pos = models.CharField(max_length=10)
    Club = models.CharField(max_length=100)
    League = models.CharField(max_length=50)
    Age = models.IntegerField()
    
    MP = models.IntegerField()
    Starts = models.IntegerField()
    Min = models.IntegerField()
    Gls = models.IntegerField()
    Ast = models.IntegerField()
    PK_x = models.IntegerField()
    PKatt_x = models.IntegerField()
    CrdY = models.IntegerField()
    CrdR = models.IntegerField()
    
    Gls_90 = models.FloatField()
    Ast_90 = models.FloatField()
    GAper90 = models.FloatField()
    GlsAst = models.IntegerField()
    
    Sh = models.IntegerField()
    SoT = models.IntegerField()
    FK = models.IntegerField()
    SoTper = models.IntegerField()
    Sh90 = models.FloatField()
    SoT90 = models.FloatField()
    GSh = models.FloatField()
    GSoT = models.FloatField()

    Tackle = models.IntegerField()
    TackleW = models.IntegerField()
    Tackleper = models.IntegerField()

    Press = models.IntegerField()
    Succ_x = models.IntegerField()
    PressPer = models.IntegerField()
    
    Blocks = models.IntegerField()
    ShotB = models.IntegerField()
    PassB = models.IntegerField()
    Int = models.IntegerField()
    Clr = models.IntegerField()

    PassesCompleted = models.IntegerField()
    PassesAttempted = models.IntegerField()
    CmpPer = models.IntegerField()
    Touches = models.IntegerField()

    Succ_y = models.IntegerField()
    Attempted = models.IntegerField()
    DribSuccPer = models.IntegerField()

    PI = models.IntegerField()
    NR = models.IntegerField()

    class Meta:
        db_table = 'players'
    def __str__(self):
        return self.name
    
class PlayerValue(models.Model):
    player = models.ForeignKey(PlayerStats, on_delete=models.CASCADE, related_name='values')
    year = models.IntegerField()
    market_value = models.FloatField()
    
    class Meta:
        unique_together = ('player', 'year')
        
    def __str__(self):
        return f"{self.player.name} - {self.year}: {self.market_value}"

class Prediction(models.Model):
    player = models.ForeignKey(PlayerStats, on_delete=models.CASCADE, related_name='predictions')
    prediction_year = models.IntegerField()
    predicted_value = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.player.name} - {self.prediction_year}: {self.predicted_value}"
