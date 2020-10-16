
import sys
import requests
import xmltodict
from collections import OrderedDict
import hashlib
from json import dumps
from .models import BBBServer


class Meeting:
    def __init__(self, name, meeting_id, link, participant_count, attendee_pw):
        self.name = name
        self.meeting_id = meeting_id
        self.link = link
        self.participant_count = participant_count
        self.attendee_pw = attendee_pw

def get_meetings(bbb_site_id):
    bbb_site_obj = BBBServer.objects.filter(id=bbb_site_id)
    if bbb_site_obj:
        bbb_site_obj = bbb_site_obj[0]
    else:
        return None
    bbb_site, secret = bbb_site_obj.url, bbb_site_obj.secret
    csum = hashlib.sha1(f"getMeetings{secret}".encode()).hexdigest()
    bbb_api_get_meetings  = f"https://{bbb_site}/bigbluebutton/api/getMeetings?checksum={csum}"

    r = requests.get(bbb_api_get_meetings)
    my_xml = r.text


    try:
        meetings = xmltodict.parse(my_xml)['response']['meetings']['meeting']
    except:
        return "no meetings"
    if type(meetings) != list:
        meetings = [meetings]

    participantCount = 0
    new_meetings = []
    for meeting in meetings:
        
        full_name = "BBBGuest"
        participantCount += int(meeting['participantCount'])
        meetingID = meeting['meetingID']
        
        attendeePW = meeting['moderatorPW']
        link_data = f"joinfullName={full_name}&meetingID={meetingID}&password={attendeePW}&redirect=true" + secret
        checksum = hashlib.sha1(link_data.encode()).hexdigest()
        meeting['link'] = f"http://{bbb_site}/bigbluebutton/api/join?fullName={full_name}&meetingID={meetingID}&password={attendeePW}&redirect=true&checksum={checksum}"
        m = Meeting(meeting['meetingName'],meetingID, meeting['link'], meeting['participantCount'], attendeePW)
        new_meetings.append(m)

    return new_meetings, len(meetings), participantCount

