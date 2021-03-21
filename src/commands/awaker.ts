import { GluegunCommand } from "gluegun";

// const porcupine = require("@picovoice/porcupine-node");
// const { COMPUTER } = require("@picovoice/porcupine-node/builtin_keywords");
// const recorder = require("node-record-lpcm16");
// import porcupine from "@picovoice/porcupine-node";

import WakeWordDetector from "../wakeword/detector";

const command: GluegunCommand = {
  name: "awaker",
  run: async toolbox => {
    const { print } = toolbox;

    print.info("Welcome to your wake word detector");

    return new Promise(async (resolve, reject) => {
      const detector = new WakeWordDetector("computer");
      detector.start_listening(() => {
        print.info("COMPUTER detected");
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
