from djongo import models

# ============================================
# Model for Midfielders
# ============================================
class Midfielders(models.Model):
    player = models.CharField(max_length=100, db_column='Player')
    nation = models.CharField(max_length=100, db_column='Nation')
    position = models.CharField(max_length=100, db_column='Pos')
    squad = models.CharField(max_length=100, db_column='Squad')
    comp = models.CharField(max_length=100, db_column='Comp')
    age = models.IntegerField(db_column='Age')
    born = models.IntegerField(db_column='Born')
    mp = models.IntegerField(db_column='MP')
    starts = models.IntegerField(db_column='Starts')
    min = models.IntegerField(db_column='Min')
    ninety_s = models.FloatField(db_column='NinetyS')
    recov = models.FloatField(db_column='Recov')  
    pastotcmp = models.FloatField(db_column='PasTotCmp')  
    pastotcmp_percentage = models.FloatField(db_column='PasTotCmpPerc')   
    pasprog = models.FloatField(db_column='PasProg')  
    tklmid3rd = models.FloatField(db_column='TklMid3rd')  
    carprog = models.FloatField(db_column='CarProg')  
    int = models.FloatField(db_column='Int')  

    class Meta:
        db_table = 'midfielders'
        managed=False
    def __str__(self):
        return self.player


# ============================================
# Model for Forwards 
# ============================================
class Forwards(models.Model):
    player = models.CharField(max_length=100, db_column='Player')
    nation = models.CharField(max_length=100, db_column='Nation')
    position = models.CharField(max_length=100, db_column='Pos')
    squad = models.CharField(max_length=100, db_column='Squad')
    comp = models.CharField(max_length=100, db_column='Comp')
    age = models.IntegerField(db_column='Age')
    born = models.IntegerField(db_column='Born')
    mp = models.IntegerField(db_column='MP')
    starts = models.IntegerField(db_column='Starts')
    min = models.IntegerField(db_column='Min')
    ninety_s = models.FloatField(db_column='NinetyS')
    goals = models.IntegerField(db_column='Goals')  
    sot = models.IntegerField(db_column='SoT')  
    sot_percentage = models.FloatField(db_column='SoTPerc')    
    scash = models.FloatField(db_column='ScaSh')  
    touattpen = models.IntegerField(db_column='TouAttPen')  
    assists = models.IntegerField(db_column='Assists')  
    sca = models.FloatField(db_column='Sca')  

    class Meta:
        db_table = 'forwards'
        managed = False
    def __str__(self):
        return self.player

# ============================================
# Model for Defenders
# ============================================
class Defenders(models.Model):
    player = models.CharField(max_length=100, db_column='Player')
    nation = models.CharField(max_length=100, db_column='Nation')
    position = models.CharField(max_length=100, db_column='Pos')
    squad = models.CharField(max_length=100, db_column='Squad')
    comp = models.CharField(max_length=100, db_column='Comp')
    age = models.IntegerField(db_column='Age')
    born = models.IntegerField(db_column='Born')
    mp = models.IntegerField(db_column='MP')
    starts = models.IntegerField(db_column='Starts')
    min = models.IntegerField(db_column='Min')
    ninety_s = models.FloatField(db_column='NinetyS')
    aerwon_percentage = models.FloatField(db_column='AerWonPerc')   
    tklwon = models.IntegerField(db_column='TklWon')  
    clr = models.IntegerField(db_column='Clr')  
    blksh = models.IntegerField(db_column='BlkSh')  
    int = models.IntegerField(db_column='Int')  
    pasmedcmp = models.FloatField(db_column='PasMedCmp')  
    pasmedcmp_percentage = models.FloatField(db_column='PasMedCmpPerc')    

    class Meta:
        db_table = 'defenders'
        managed = False
    def __str__(self):
        return self.player

# ============================================
# Model for Goalkeepers
# ============================================
class Goalkeepers(models.Model):
    player = models.CharField(max_length=100, db_column='Player')
    nation = models.CharField(max_length=100,db_column='Nation')
    position = models.CharField(max_length=100, db_column='Pos')
    squad = models.CharField(max_length=100, db_column='Squad')
    comp = models.CharField(max_length=100, db_column='Comp')
    age = models.IntegerField(db_column='Age')
    born = models.IntegerField(db_column='Born')
    mp = models.IntegerField(db_column='MP')
    starts = models.IntegerField(db_column='Starts')
    min = models.IntegerField(db_column='Min')
    ninety_s = models.FloatField(db_column='NinetyS')
    pastotcmp_percentage = models.FloatField(db_column='PasTotCmpPerc')    
    pastotcmp = models.FloatField(db_column='PasTotCmp')  
    err = models.IntegerField(db_column='Err')  
    save_percentage = models.FloatField(db_column='SavePerc')  
    sweeper_actions = models.IntegerField(db_column='SweeperActions')  
    pas3rd = models.FloatField(db_column='Pas3rd')   

    class Meta:
        db_table = 'goalkeepers'
        managed = False
    def __str__(self):
        return self.player