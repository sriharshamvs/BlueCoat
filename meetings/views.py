from django.shortcuts import render, redirect
from django.contrib.auth import logout
from .bbb_interface import get_meetings

from .models import *
# Create your views here.

def show_meetings(request, server_id):
    if request.user.is_authenticated:
        bbb_server = BBBServer.objects.filter(id=server_id, groups__in = request.user.groups.all())
        if not bbb_server:
            return render(request, 'meetings/no_access.html')
        bbb_server = bbb_server[0]
        bbb_servers = BBBServer.objects.filter(groups__in = request.user.groups.all()).distinct()

        bbb_r = get_meetings(server_id)
        if bbb_r == 'no meetings':
            return render(request, 'meetings/no_meetings.html', {'bbb_server':bbb_server, 'bbb_servers' : bbb_servers})
        else:
            meetings, num_meetings, total_participants = bbb_r
        broadcast_pods = BBBBroadcastPod.objects.filter(groups__in = request.user.groups.all()).distinct()
        
        stream_origins = StreamOrigin.objects.filter(groups__in = request.user.groups.all()).distinct()

        return render(request, 'meetings/meetings.html', {'meetings' : meetings, 'num_meetings':num_meetings, 'total_participants':total_participants, 'bbb_server': bbb_server, 'broadcast_pods': broadcast_pods, 'bbb_servers':bbb_servers, 'stream_origins' : stream_origins})
    return redirect('/accounts/login')


def auth(request):
    al = ActivityLog()
    al.user = request.user 
    if request.user.is_authenticated:
        al.event = ActivityLog.LOGGED_IN
        al.save()
        return redirect('/')
    
def logout_view(request):
    if request.user.is_authenticated:
        al = ActivityLog()
        al.user = request.user 
        al.event = ActivityLog.LOGGED_OUT
        al.save()
        logout(request)
    return redirect('/')

def home(request):
    
    if request.user.is_authenticated:
        servers = BBBServer.objects.filter(groups__in = request.user.groups.all())
        if servers:
            return show_meetings(request, servers[0].id)
        return render(request, 'meetings/no_servers.html')
    return redirect('/accounts/login')


