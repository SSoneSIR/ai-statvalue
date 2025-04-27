from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from django.utils import timezone

class CustomUser(AbstractUser):
   
    # Use UUID as primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)

    # Email field (AbstractUser already has username)
    email = models.EmailField(unique=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    
    def __str__(self):
        return self.username
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'