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
    this.frame_accumulator = [];
    this.detect_callback = null;
  }

  start_listening(detect_callback) {
    this.detect_callback = detect_callback;
  }

  async consume_audio(data)
  {
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
        await this.detect_callback();
      }
    }
  }

  stop_listening() {
    this.detect_callback = null;
    this.frame_accumulator = [];
  }
}

export default WakeWordDetector;
