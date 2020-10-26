
const SOCKET_CLOSED = 0;
const POD_IDLE = 1;
const POD_BUSY = 2;
const INDETERMINATE = 3;
const STATE_COLORS = ['dark', 'success', 'danger', 'warning'];
const STATE_MESSAGES = ['Down', 'Idle', 'Busy', 'Unknown'];


startStream = function(ev) {
    
    var data_id = ev.target.attributes['data-id'].nodeValue;
    var meeting_name = ev.target.attributes['data-meeting-name'].nodeValue;
    var bbb_url = ev.target.attributes['data-bbb-url'].nodeValue;
    var bbb_secret = ev.target.attributes['data-bbb-secret'].nodeValue;
    var state = ev.target.attributes['data-state'].nodeValue;
    
    if (state == 'idle') {
        var link = document.querySelector('#sr_'+data_id).value;
        if (link.length < 3){
            toastr.error("Invalid Stream Key");
            return;
        }
        link =  document.querySelector('#so_'+data_id).value + link;

        var podid = document.querySelector('#ps_'+data_id).value;
        if (podid.length == 0) {
            toastr.error("Looks like all pods are busy !!");
            return;
        }
        var pod = broadcast_pods[podid];
        //var altstopbtn = document.querySelector("#stopstream_"+podid.substr(3));
        //altstopbtn.setAttribute('stop_button_id',ev.target.id);
        
        console.log(podid, pod);
        
        pod.startStream(bbb_url, bbb_secret, data_id, meeting_name, link);
        toastr.info("Started Meeting :"+meeting_name+" on pod : " + pod.name);

        ev.target.attributes['data-state'].nodeValue = 'busy';
        ev.target.attributes['data-pod'].nodeValue = podid;
        ev.target.innerHTML = 'Stop Stream';
        ev.target.className = 'btn btn-danger';

    } else if (state == 'busy') {
        var podid = ev.target.attributes['data-pod'].nodeValue;
        var pod = broadcast_pods[podid];
        pod.stopStream();
        toastr.warning("Stopped Meeting :"+meeting_name+" on pod : " + pod.name);
        ev.target.attributes['data-state'].nodeValue = 'idle';
        ev.target.innerHTML = 'Start Stream';
        ev.target.className = 'btn btn-success';
    }
}


removeFromList = function(podid) {
    for(var i =0; i < meetings.length; i++) {
        meeting_id = meetings[i];
        select_box = document.querySelector("#ps_"+meeting_id);
        for ( var j = 0, l = select_box.options.length; j < l; j++ ) {

            if ( select_box.options[j].value == 'bp_'+podid ) {
    
                select_box.options[j].remove();
                break;
    
            }
    
        }
    
    }
}

addToList = function(podid, podname) {
    for(var i =0; i < meetings.length; i++) {
        meeting_id = meetings[i];
        select_box = document.querySelector("#ps_"+meeting_id);
        var found = false;
        for ( var j = 0, l = select_box.options.length; j < l; j++ ) {

            if ( select_box.options[j].value == 'bp_'+podid ) {
    
                found = true;
                break;
            }
        }
        if (found == false) {
            select_box.innerHTML += "<option value='bp_"+podid+"'>"+podname+"</option>";
        }
    
    }
}


class BroadcastPod {

    constructor(id, name, host, port, parel) {
        this.id =  id;
        this.name = name;
        this.host = host;
        this.port = port;
        this.state = SOCKET_CLOSED;
        this.meeting_id = "";
        this.url = "ws://" + this.host + ":" + this.port;
        this.ws = new WebSocket(this.url);
        this.ws.onmessage = this.msgHandler;
        this.ws.pod = this;
        this.ws.onopen = function () {
            this.send(JSON.stringify({command:'status'}));
        };
        this.ws.onclose = this.exitHandler;
        this.parel_id = parel;
        this.parel = document.querySelector(parel);
        this.addElement();
        removeFromList(this.id);
        var stel = document.querySelector('#state_'+this.id);
        stel.innerHTML = '<span class="badge badge-'+STATE_COLORS[this.state]+'">'+STATE_MESSAGES[this.state]+'</span>';
        
        document.querySelector('#details_'+this.id).pod = this;
        document.querySelector('#output_'+this.id).pod = this;
        document.querySelector('#stopstream_'+this.id).pod = this;
        document.querySelector('#details_'+this.id).hidden = true;
        document.querySelector('#output_'+this.id).hidden = true;            
        document.querySelector('#stopstream_'+this.id).hidden = true;
        document.querySelector('#action_'+this.id).pod = this;

        document.querySelector('#action_'+this.id).onclick = function(ev) {
            
            document.querySelector('#bpcard_'+this.pod.id).remove();
            this.pod = new BroadcastPod(this.pod.id, this.pod.name, this.pod.host, this.pod.port, this.pod.parel_id);
            broadcast_pods["bp_"+this.pod.id] = this.pod;
        }

        document.querySelector('#details_'+this.id).onclick = function(ev) {            
            this.pod.send({command:'get_details'})            
        }
        document.querySelector('#output_'+this.id).onclick = function(ev) {            
            this.pod.send({command:'get_output'})            
        }
        
    }

    startStream(bbb_url, bbb_secret, bbb_meeting_id, bbb_meeting_name, stream_link) {
        this.send({"command":"start_stream", "bbb_url":bbb_url, "bbb_secret": bbb_secret, "bbb_meeting_id":bbb_meeting_id, "bbb_stream_url":stream_link, "bbb_meeting_name": bbb_meeting_name});
    }

    stopStream() {
        this.send({"command":"close_stream"});
    }

    send(msg) {
        console.log(this.ws);
        console.log(JSON.stringify(msg));
        this.ws.send(JSON.stringify(msg));
    }
    isAlive() {
        this.send({command:'status'});
    }

    openHandler(x) {
        this.isAlive();
    }

    updateState() {
        var stel = document.querySelector('#state_'+this.id);
        stel.innerHTML = '<span class="badge badge-'+STATE_COLORS[this.state]+'">'+STATE_MESSAGES[this.state]+'</span>';
        
        if (this.state != SOCKET_CLOSED ) {
            document.querySelector('#action_'+this.id).hidden = true;
            
        } else {
            document.querySelector('#action_'+this.id).hidden = false;
            document.querySelector('#action_'+this.id).pod = this;
            document.querySelector('#action_'+this.id).onclick = function(ev) {
            
                document.querySelector('#bpcard_'+this.pod.id).remove();
                this.pod = new BroadcastPod(this.pod.id, this.pod.name, this.pod.host, this.pod.port, this.pod.parel_id);
	        broadcast_pods["bp_"+this.pod.id] = this.pod;
                
            }
            if (this.state != INDETERMINATE) {
                toastr.error("Unable to connect to :"+this.name+" @ " +this.url);
            }
        }

        if (this.state == POD_BUSY) {
            document.querySelector('#details_'+this.id).hidden = false;
            document.querySelector('#output_'+this.id).hidden = false;     
            document.querySelector('#stopstream_'+this.id).hidden = false;

            document.querySelector('#details_'+this.id).pod = this;
        document.querySelector('#output_'+this.id).pod = this;
        document.querySelector('#details_'+this.id).onclick = function(ev) {   
            ev.target.setAttribute('data-clicked', "true");         
            this.pod.send({command:'get_details'})            
        }
        document.querySelector('#output_'+this.id).onclick = function(ev) {            
            this.pod.send({command:'get_output'})            
        }
        document.querySelector('#stopstream_'+this.id).onclick = function(ev) {            
            this.pod.send({command:'close_stream'})            
            //toastr.info("Stream Stopped");
            if (this.pod.meeting_id.length > 0){
                var altbuttonid = "#sm_"+this.pod.meeting_id;
                var altbutton = document.querySelector(altbuttonid);
                if (altbutton) {
                    var meeting_name = altbutton.attributes['data-meeting-name'].nodeValue;
                    altbutton.attributes['data-state'].nodeValue = 'idle';
                    altbutton.innerHTML = 'Start Stream';
                    altbutton.className = 'btn btn-success';
                    toastr.warning("Stopped Meeting :"+meeting_name+" on pod : " + this.pod.name);
                }
            }
        }
        
        

        } else {
            document.querySelector('#details_'+this.id).hidden = true;
            document.querySelector('#output_'+this.id).hidden = true;            
            document.querySelector('#stopstream_'+this.id).hidden = true;            
        }
    }

    exitHandler(x) {
        console.log("Hiii!");
        this.pod.state = SOCKET_CLOSED;
        this.pod.updateState();
        removeFromList(this.pod.id);
    }

    addElement() {
        this.parel.innerHTML += '<div class="card mb-3" id="bpcard_'+this.id+'"><div class="row no-gutters"><div class="col-md-2"><div class="card-body"><p class="card-text">'+this.name+'</p></div></div><div class="col-md-3"><div class="card-body"><p class="card-text "> URL : '+this.url+'</p></div></div><div class="col-md-2"><div class="card-body"><p class="card-text" id="state_'+this.id+'">'+this.state+'</p></div></div><div class="col-md-5"><div class="card-body"><button class="btn btn-primary" id="action_'+this.id+'" >Retry</button><div class="btn-group" role="group"><button class="btn btn-primary" id="details_'+this.id+'" data-clicked="false">Get Details</button><button class="btn btn-primary" id="output_'+this.id+'" >Get Output</button><button class="btn btn-danger" id="stopstream_'+this.id+'" >Stop Stream</button></div></div></div></div></div>';        
        //this.updateState();
    }

    msgHandler(msg) {
        var data = JSON.parse(msg.data);
        console.log(data);
        if (data.command == 'status') {
            if (data.status == 'idle') {
                this.pod.state = POD_IDLE;
                
                if (this.pod.meeting_id.length > 0){
                    var altbuttonid = "#sm_"+this.pod.meeting_id;
                    var altbutton = document.querySelector(altbuttonid);
                    if (altbutton) {
                        var meeting_name = altbutton.attributes['data-meeting-name'].nodeValue;
                        altbutton.attributes['data-state'].nodeValue = 'idle';
                        altbutton.innerHTML = 'Start Stream';
                        altbutton.className = 'btn btn-success';
                        toastr.warning("Stopped Meeting :"+meeting_name+" on pod : " + this.pod.name);
                    }
                }
                
                this.pod.meeting_id = "";
                addToList(this.pod.id, this.pod.name);




            } else if (data.status == 'busy') {
                this.pod.state = POD_BUSY;
                this.pod.send({command:'get_details'});
                removeFromList(this.pod.id);
            }
            
            this.pod.updateState();
        } else if (data.command == 'get_details') {
            this.pod.meeting_id =data.bbb_meeting_id;
            var details_button = document.querySelector("#details_"+this.pod.id);
            var details_clicked = details_button.attributes['data-clicked'].nodeValue;
            if (details_clicked == "true"){
                var message = "BBB Server: " + data.bbb_url + " <br> Meeting ID : " + data.bbb_meeting_id + "<br>" + "Meeting Name : " + data.bbb_meeting_name + "<br>" + "Streaming to : " + data.bbb_stream_url;
                toastr.info(message);
                details_button.setAttribute('data-clicked', "false");      
            } else {
                if (this.pod.meeting_id.length > 0){
                    var altbuttonid = "#sm_"+this.pod.meeting_id;
                    var altbutton = document.querySelector(altbuttonid);
                    if (altbutton) {
                        var meeting_name = altbutton.attributes['data-meeting-name'].nodeValue;
                        altbutton.attributes['data-state'].nodeValue = 'busy';
                        altbutton.innerHTML = 'Stop Stream';
                        altbutton.className = 'btn btn-danger';
                        altbutton.attributes['data-pod'].nodeValue = "bp_"+this.pod.id;
                        //toastr.warning("Stopped Meeting :"+meeting_name+" on pod : " + this.pod.name);
                    }
                }
                
            }
        } else if (data.command == 'get_output') {
            alert(data.stdout);
        }
    }


}
