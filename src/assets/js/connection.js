// need to split this intelligently, might be above me
import Video from "./sfu/video.js"
import Mesh from "./mesh/mesh.js"
import DamEventEmitter from "./emitter.js";
import MetaData from "./metadata.js";

// create global scope to avoid .bind(this)
var med = null;
const SFU_ENABLED = true;

export default class Connection {
  constructor(mediator) {
    med = mediator;
    this.inited = false;    
    return this;
  }

  init() {
    this.initDamSocket();
    this.initMetaData()
    
  }

  initDamSocket() {
    med.damSocket = new DamEventEmitter(med.root, med.room);
  }

  initMetaData() {
    med.socketId = med.h.uuidv4();
    med.metaData = new MetaData(med.root, med.room, med.socketId, this.metaDataReceived);
    med.damSocket.setMetaData(med.metaData);
    med.metaData.sendControlData({ username: med.username, sender: med.username, status: "online", audioMuted: med.audioMuted, videoMuted: med.videoMuted });
  }

  establish() {
    this.init();
    this.unhide();
    if (SFU_ENABLED) {
      console.log("Start SFU");
      this.video = new Video(med).establish();
    } else {
      console.log("Start MESH");
      new Mesh(med).establish();
    }
  }

  unhide() {
    let commElem = document.getElementsByClassName("room-comm");
    for (let i = 0; i < commElem.length; i++) {
      commElem[i].hidden = false;
    }
    document.getElementById("demo").hidden = false;
    document.getElementById("bottom-menu").hidden = false;
  }

  metaDataReceived(data) {
    if (data.event == "chat") {
      if (data.ts && Date.now() - data.ts > 5000) return;
      if (data.socketId == med.socketId || data.sender == med.socketId) return;
      if (data.sender == med.username) return;
      if (med.DEBUG) console.log("got chat", data);
      med.h.addChat(data, "remote");
    } else if (data.event == "notification") {
      if (data.ts && Date.now() - data.ts > 5000 || data.ts == undefined || data.username == med.username) return;
      if (data.subEvent == "recording") {
        if (data.isRecording) {
          var notification = data.username + " started recording this meething";
          med.h.showNotification(notification);
        } else {
          var notification = data.username + " stopped recording this meething"
          med.h.showNotification(notification);
        }
      } else if (data.subEvent == "grid") {
        if (data.isOngrid) {
          var notification = data.username + " is going off the grid";
          med.h.showNotification(notification);
        } else {
          var notification = data.username + " is back on the grid"
          med.h.showNotification(notification);
        }
      } else if (data.subEvent == "mute") {
        if (data.muted) {
          var notification = data.username + " is going silence";
          med.h.showNotification(notification);
        } else {
          var notification = data.username + " is on speaking terms"
          med.h.showNotification(notification);
        }
      }
    } else if (data.event == "control") {
      if (data.username && data.socketId) {
        med.h.swapUserDetails(data.socketId + "-title", data);
      }
      if (data.talking) {
        if (med.DEBUG) console.log('Speaker Focus on ' + data.username);
        med.h.swapDiv(data.socketId + "-widget");
      }
      if (data.readonly) {
        if (med.DEBUG) console.log('Read-Only Joined: ' + data.username);
        med.h.showNotification("Read-Only Join by " + data.username);
        med.h.hideVideo(data.socketId, true);
      }
    }
    else {
      if (med.DEBUG) console.log("META::" + JSON.stringify(data));
      //TODO @Jabis do stuff here with the data
      //data.socketId and data.pid should give you what you want
      //Probably want to filter but didnt know if you wanted it filter on socketId or PID
    }
    // TODO update graph
  }
}
