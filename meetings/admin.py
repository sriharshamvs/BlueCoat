from django.contrib import admin
from .models import * 


class StreamAdmin(admin.ModelAdmin):
    list_display = ['bbb_server', 'meeting_name', 'broadcast_pod', 'stream_origin']
    list_filter = ['bbb_server', 'meeting_name', 'broadcast_pod', 'stream_origin']

class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user','event']
    list_filter = ['user','event']


# Register your models here.
admin.site.register(BBBServer)
admin.site.register(StreamOrigin)
admin.site.register(BBBBroadcastPod)
admin.site.register(Stream, StreamAdmin)
admin.site.register(ActivityLog, ActivityLogAdmin)