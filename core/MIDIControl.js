const WebMidi = require('./node_modules/webmidi');

class MIDIControl {
  constructor() {
    WebMidi.enable(function(err) {
      if(err) {
        console.log(err);
      } else {
        // Akai LPD8 has 8 pads and 8 knobs
        this.lpd8 = WebMidi.getInputByName('Akai LPD8 Wireless');

        if(this.lpd8) {
          // Pads
          this.lpd8.addListener('noteon', 'all', function(e) {            
            let midiEvent = new CustomEvent('noteon', {
              detail: {
                note: e.note.number,
                velocity: e.velocity
              }
            });

            // Bubble up a custom event available to p5js sketch
            document.dispatchEvent(midiEvent);
          });
  
          // Knobs
          this.lpd8.addListener('controlchange', 'all', function(e) {
            let midiEvent = new CustomEvent('controlchange', {
              detail: {
                controller: e.controller.number,
                value: e.value
              }
            });

            // Bubble up a custom event available to p5js sketch
            document.dispatchEvent(midiEvent);
          });
        }
      }
    });
  }
}

module.exports = MIDIControl;