from djongo import models

# Model for Midfielders collection
class Midfielders(models.Model):
    player = models.CharField(max_length=100)
    nation = models.CharField(max_length=100)
    squad = models.CharField(max_length=100)
    comp = models.CharField(max_length=100)
    age = models.IntegerField()
    born = models.DateField()
    mp = models.IntegerField()
    starts = models.IntegerField()
    min = models.IntegerField()
    ninety_s = models.FloatField()
    recov = models.FloatField()  # New stat
    pastotcmp = models.FloatField()  # New stat
    pastotcmp_percentage = models.FloatField()  # New stat (percentage of past completions)
    pasprog = models.FloatField()  # New stat
    tklmid3rd = models.FloatField()  # New stat
    carprog = models.FloatField()  # New stat
    int = models.FloatField()  # New stat

    class Meta:
        db_table = 'midfielders'


# Model for Forwards collection
class Forwards(models.Model):
    player = models.CharField(max_length=100)
    nation = models.CharField(max_length=100)
    squad = models.CharField(max_length=100)
    comp = models.CharField(max_length=100)
    age = models.IntegerField()
    born = models.DateField()
    mp = models.IntegerField()
    starts = models.IntegerField()
    min = models.IntegerField()
    ninety_s = models.FloatField()
    goals = models.IntegerField()  # New stat
    sot = models.IntegerField()  # New stat
    sot_percentage = models.FloatField()  # New stat (percentage of shots on target)
    scash = models.FloatField()  # New stat
    touattpen = models.IntegerField()  # New stat
    assists = models.IntegerField()  # New stat
    sca = models.FloatField()  # New stat

    class Meta:
        db_table = 'forwards'


# Model for Defenders collection
class Defenders(models.Model):
    player = models.CharField(max_length=100)
    nation = models.CharField(max_length=100)
    squad = models.CharField(max_length=100)
    comp = models.CharField(max_length=100)
    age = models.IntegerField()
    born = models.DateField()
    mp = models.IntegerField()
    starts = models.IntegerField()
    min = models.IntegerField()
    ninety_s = models.FloatField()
    aerwon_percentage = models.FloatField()  # New stat (percentage of aerial duels won)
    tklwon = models.IntegerField()  # New stat
    clr = models.IntegerField()  # New stat
    blksh = models.IntegerField()  # New stat
    int = models.IntegerField()  # New stat
    pasmedcmp = models.FloatField()  # New stat
    pasmedcmp_percentage = models.FloatField()  # New stat (percentage of successful passes)

    class Meta:
        db_table = 'defenders'


# Model for Goalkeepers collection
class Goalkeepers(models.Model):
    player = models.CharField(max_length=100)
    nation = models.CharField(max_length=100)
    squad = models.CharField(max_length=100)
    comp = models.CharField(max_length=100)
    age = models.IntegerField()
    born = models.DateField()
    mp = models.IntegerField()
    starts = models.IntegerField()
    min = models.IntegerField()
    ninety_s = models.FloatField()
    pastotcmp_percentage = models.FloatField()  # New stat (percentage of total passes completed)
    pastotcmp = models.FloatField()  # New stat
    err = models.IntegerField()  # New stat
    save_percentage = models.FloatField()  # New stat (percentage of saves)
    sweeper_actions = models.IntegerField()  # New stat
    pas3rd = models.FloatField()  # New stat (passing into the 3rd of the field)

    class Meta:
        db_table = 'goalkeepers'
