from django.db import models
from django.contrib.auth.models import Group, User
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

class Stream(models.Model):
    broadcast_pod = models.ForeignKey(BBBBroadcastPod, on_delete=models.CASCADE)
    stream_origin = models.ForeignKey(StreamOrigin, on_delete=models.CASCADE)
    bbb_server = models.ForeignKey(BBBServer, on_delete=models.CASCADE)
    meeting_name = models.CharField(max_length=1000)
    meeting_link = models.CharField(max_length=1000)
    meeting_id = models.CharField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)

   

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stream = models.ForeignKey(Stream, on_delete=models.CASCADE, null=True, blank=True)
    LOGGED_IN = "1"
    LOGGED_OUT = "2"
    STREAM_START = "3"
    STREAM_STOP = "4"
    EVENT_CHOICES = [
        (LOGGED_IN, 'Logged In'),
        (LOGGED_OUT, 'Logged Out'),
        (STREAM_START, 'Stream Started'),
        (STREAM_STOP, 'Stream Stopped'),        
    ]
    event = models.CharField(max_length=2, choices=EVENT_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)