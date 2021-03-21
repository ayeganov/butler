const porcupine = require("@picovoice/porcupine-node");
const {
  COMPUTER,
  ALEXA,
  AMERICANO,
  BLUEBERRY,
  GRAPEFRUIT,
  GRASSHOPPER,
  HEY_GOOGLE,
  HEY_SIRI,
  JARVIS,
  OK_GOOGLE,
  PICOVOICE,
  PORCUPINE,
  TERMINATOR,
  BUMBLEBEE
} = require("@picovoice/porcupine-node/builtin_keywords");
const recorder = require("node-record-lpcm16");

const WAKE_WORDS = {
  computer: COMPUTER,
  alexa: ALEXA,
  americano: AMERICANO,
  blueberry: BLUEBERRY,
  bumblebee: BUMBLEBEE,
  grapefruit: GRAPEFRUIT,
  grasshopper: GRASSHOPPER,
  hey_google: HEY_GOOGLE,
  hey_siri: HEY_SIRI,
  jarvis: JARVIS,
  ok_google: OK_GOOGLE,
  picovoice: PICOVOICE,
  porcupine: PORCUPINE,
  terminator: TERMINATOR
};

function chunkArray(array, size) {
  return Array.from({ length: Math.ceil(array.length / size) }, (v, index) =>
    array.slice(index * size, index * size + size)
  );
}

class WakeWordException {
  constructor(message) {
    this.message = message;
  }
}


class WakeWordDetector {
  constructor(wake_word) {
    const wake_model = WAKE_WORDS[wake_word];
    this.porcupine_instance = new porcupine([wake_model], [0.5]);
    this.frame_length = this.porcupine_instance.frameLength;

    const sample_rate = this.porcupine_instance.sampleRate;
    this.listener = recorder.record({
      sampleRate: sample_rate,
      channels: 1,
      audioType: "raw",
      recorder: "sox"
    });

    this.frame_accumulator = [];
    this.detect_callback = null;
    this.stream = null;
  }

  start_listening(detect_callback) {
    if (this.stream !== null) {
      throw new WakeWordException("Detector is already running");
    }
    this.detect_callback = detect_callback;
    this.stream = this.listener.stream();
    this.stream.on("data", data => {
      this._on_data(data);
    });
    this.stream.on("error", error => {
      this._on_error(error);
    });
  }

  _on_error(error) {
    console.error(`Sound recorder error: ${error}`);
  }

  _on_data(data) {
    // Two bytes per Int16 from the data buffer
    const new_frames16 = new Array(data.length / 2);
    for (let i = 0; i < data.length; i += 2) {
      new_frames16[i / 2] = data.readInt16LE(i);
    }

    // Split the incoming PCM integer data into arrays of size
    // Porcupine.frameLength. If there's insufficient frames, or a remainder,
    // store it in 'frameAccumulator' for the next iteration, so that we don't
    // miss any audio data
    this.frame_accumulator = this.frame_accumulator.concat(new_frames16);
    const frames = chunkArray(this.frame_accumulator, this.frame_length);

    const last_frame_is_not_full =
      frames[frames.length - 1].length !== this.frame_length;

    if (last_frame_is_not_full) {
      // store remainder from divisions of frameLength
      this.frame_accumulator = frames.pop();
    } else {
      this.frame_accumulator = [];
    }

    for (const frame of frames) {
      const index = this.porcupine_instance.process(frame);
      if (index !== -1) {
        this.detect_callback();
      }
    }
  }

  stop_listening() {
    this.listener.stop();
    this.stream = null;
    this.detect_callback = null;
    this.frame_accumulator = [];
  }
}

export default WakeWordDetector;

// recording.stream().on("data", data => {
//   // Two bytes per Int16 from the data buffer
//   let newFrames16 = new Array(data.length / 2);
//   for (let i = 0; i < data.length; i += 2) {
//     newFrames16[i / 2] = data.readInt16LE(i);
//   }
//   // Split the incoming PCM integer data into arrays of size
//   // Porcupine.frameLength. If there's insufficient frames, or a remainder,
//   // store it in 'frameAccumulator' for the next iteration, so that we don't
//   // miss any audio data
//   frameAccumulator = frameAccumulator.concat(newFrames16);
//   let frames = chunkArray(frameAccumulator, frameLength);
//
//   if (frames[frames.length - 1].length !== frameLength) {
//     // store remainder from divisions of frameLength
//     frameAccumulator = frames.pop();
//   } else {
//     frameAccumulator = [];
//   }
//
//   for (const frame of frames) {
//     let index = porcupineInstance.process(frame);
//     if (index !== -1) {
//       console.log(`Detected 'COMPUTER'`);
//     }
//   }
// });
//
//
// console.log(`Listening for 'COMPUTER'...`);
// process.stdin.resume();
// console.log("Press ctrl+c to exit.");
