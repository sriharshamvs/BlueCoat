from django.db import models
from django.contrib.auth.models import Group
# Create your models here.




class BBBServer(models.Model):
    url = models.CharField(max_length=2000)
    secret = models.CharField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    groups = models.ManyToManyField(Group)

    def __str__(self):
        return self.url

class StreamOrigin(models.Model):
    name = models.CharField(max_length=1000)
    url = models.CharField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    groups = models.ManyToManyField(Group)

    def __str__(self):
        return self.url


class BBBBroadcastPod(models.Model):
    name = models.CharField(max_length=1000)
    host = models.CharField(max_length=2000)
    port = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    groups = models.ManyToManyField(Group)

    def __str__(self):
        return f"{self.name} - ws://{self.host}:{self.port}"
