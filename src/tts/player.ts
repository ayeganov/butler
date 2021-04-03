
import { AudioIO, SampleFormat16Bit, /*IoStreamWrite*/ } from "naudiodon";
import { Readable } from "stream";


export class AudioPlayer
{
  async play_audio(audio: Uint8Array|string): Promise<void>
  {
    return new Promise<void>(async (resolve, reject) => {
      const audio_io = AudioIO({
        outOptions: {
          channelCount: 1,
          sampleFormat: SampleFormat16Bit,
          sampleRate: 24000,
          deviceId: -1,
          closeOnError: true
        }
      });

      const readable_audio = new Readable();
      readable_audio.pipe(audio_io);

      readable_audio.push(audio);
      readable_audio.push(null);

      audio_io.on("finished", () => {
        resolve();
      });

      audio_io.start();

      await resolve;
    });
  }
}
