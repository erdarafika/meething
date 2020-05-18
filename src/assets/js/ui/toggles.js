export default class Toggles {
  constructor(mediator) {
    this.mediator = mediator;
    this.init();
  }

  init() {
    this.initToggleVideo();
    this.initTogglAudio();
  }

  initToggleVideo() {
    document.getElementById("toggle-video").addEventListener("click", e => {
      e.preventDefault();
      console.log("Toggle Video mute/unmute")
      window.ee.emit("video-toggle")
    });
  }

  initTogglAudio() {
    document.getElementById("toggle-mute").addEventListener("click", e => {
      e.preventDefault();
      console.log("Toggle Audio mute/unmute")
      window.ee.emit("audio-toggle")
    });
  }
}
