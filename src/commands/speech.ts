import { AudioToText } from "../speech/speech";
import { GluegunCommand } from "gluegun";
import { GoogleSpeech } from "../speech/google_speech";
import { Microphone } from "../audio/microphone_source";
import { Readable } from "stream";
import { AudioSource } from "../audio/audio_source";

const command: GluegunCommand = {
  name: "speech",
  run: async toolbox => {
    return new Promise(async (resolve, reject) => {
      const listener: AudioSource = new Microphone();
      listener.configure({
        sampleRateHertz: 16000,
        silence: 1000,
        threshold: 0,
        channels: 1,
        audioType: "raw",
        recorder: "sox"
      });

      const asr: AudioToText = new GoogleSpeech({
        encoding: "LINEAR16",
        hz_rate: 16000,
        language_code: "en-US"
      });

      const stream: Readable = listener.add_reader();
      stream.on("data", async (data: Uint8Array) => {
        asr.consume_audio_chunk(data);
      });

      console.log("Start speaking...");
      const text: string = await asr.speech_to_text();
      console.log(`Text: ${text}`);

      listener.close();
      await asr.finish();
      resolve();
    });
  }
};

module.exports = command;
