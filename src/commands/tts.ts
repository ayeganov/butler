import { GluegunCommand } from "gluegun";
import { GoogleTTS } from "../tts/google_tts";
import { TextToSpeech, AudioContent } from "../tts/tts";

import { promisify } from "util";
import { writeFile } from "fs";
import { AudioPlayer } from "../tts/player";


const command: GluegunCommand = {
  name: "tts",
  run: async toolbox => {
    return new Promise(async (resolve, reject) => {
      try
      {
        const tts: TextToSpeech = new GoogleTTS({
          gender: "FEMALE",
          language_code: "en-US",
          audio_encoding: "LINEAR16"
        });

        const audio: AudioContent = await tts.synthesize_speech(
          "Play a good song"
        );

        console.log(`I got valid results of length: ${audio.audio.length}`);
        await tts.close();

        const player = new AudioPlayer();
        await player.play_audio(audio.audio);

        const async_write_file = promisify(writeFile);
        await async_write_file("output.raw", audio.audio, "binary");
        console.log("This should appear only after audio is done playing");
      }
      catch(error)
      {
        console.error(error);
      }
    });
  }
};


module.exports = command;
