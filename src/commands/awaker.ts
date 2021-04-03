import { GluegunCommand } from "gluegun";
import { Microphone } from "../audio/microphone_source";
import { AudioSource } from "../audio/audio_source";
import WakeWordDetector from "../wakeword/detector";

import { Readable } from "stream";

const command: GluegunCommand = {
  name: "awaker",
  run: async toolbox => {
    const { print } = toolbox;

    print.info("Welcome to your wake word detector");

    return new Promise(async (resolve, reject) => {
      const detector = new WakeWordDetector("computer");

      const listener: AudioSource = new Microphone();
      listener.configure({
        sampleRateHertz: 16000,
        silence: 1000,
        threshold: 0,
        channels: 1,
        audioType: "raw",
        recorder: "sox"
      });

      const stream: Readable = listener.add_reader();
      stream.on("data", (data: Uint8Array) => {
        detector.consume_audio(data);
      });

      const foo = new Promise((resolve, reject) => { console.log("foo"); });
      detector.start_listening(async () => {
        print.info("WAKEWORD detected");
        await foo;
        print.info("Didn't wait for foo...");
      });

      process.on("SIGINT", () => {
        print.info("Exiting due to interrupt...");
        resolve();
        detector.stop_listening();
        process.exit();
      });

      console.log(`Listening for 'COMPUTER'...`);
      process.stdin.resume();
      console.log("Press ctrl+c to exit.");
    });
  }
};

module.exports = command;
