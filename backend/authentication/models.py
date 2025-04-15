from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    role = models.CharField(max_length=10, choices=[('admin', 'Admin'), ('user', 'User')], default='user')
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username
    