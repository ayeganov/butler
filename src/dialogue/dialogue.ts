import { AudioPlayer } from "../tts/player";
import { AudioSource } from "../audio/audio_source";
import { AudioToText } from "../speech/speech";
import { GoogleSpeech } from "../speech/google_speech";
import { GoogleTTS } from "../tts/google_tts";
import { Microphone } from "../audio/microphone_source";
import { TextToSpeech } from "../tts/tts";
import { Readable } from "stream";
import WakeWordDetector from "../wakeword/detector";


type OnAudioCallback = (data: Uint8Array) => void;
type SuccessDone = (value?: void | PromiseLike<void>) => void;
type FailureDone = (reason?: string) => void;

export class Dialogue
{
  private listener: AudioSource = new Microphone();

  private tts: TextToSpeech = new GoogleTTS({
    gender: "FEMALE",
    language_code: "en-US",
    audio_encoding: "LINEAR16"
  });

  private player: AudioPlayer = new AudioPlayer();

  private asr: AudioToText = new GoogleSpeech({
    encoding: "LINEAR16",
    hz_rate: 16000,
    language_code: "en-US"
  });

  private wakeword_detector: WakeWordDetector;

  private wakeword_reader: Readable;
  private asr_reader: Readable;
  private on_asr_audio_cb: OnAudioCallback;
  private on_wakeword_audio_cb: OnAudioCallback;
  private success_done: SuccessDone;
  private failure_done: FailureDone;

  constructor(wakeword: string)
  {
    this.listener.configure({
      sampleRateHertz: 16000,
      silence: 1000,
      threshold: 0,
      channels: 1,
      audioType: "raw",
      recorder: "sox"
    });

    this.wakeword_reader = this.listener.add_reader();
    this.asr_reader = this.listener.add_reader();
    this.wakeword_detector = new WakeWordDetector(wakeword);
  }

  public async start_dialogue(): Promise<void>
  {
    return new Promise((resolve, reject) => {
      this.success_done = resolve;
      this.failure_done = reject;

      this.on_asr_audio_cb = (audio: Uint8Array) => {
        this.asr.consume_audio_chunk(audio);
      };

      this.on_wakeword_audio_cb = async (audio: Uint8Array) => {
        await this.wakeword_detector.consume_audio(audio);
      };
      this.wakeword_reader.on("data", this.on_wakeword_audio_cb);
      this.wakeword_detector.start_listening(() => { this.wakeword_callback(); });
    });
  }

  private async wakeword_callback(): Promise<void>
  {
    console.log("Start speaking...");
    this.wakeword_reader.off("data", this.on_wakeword_audio_cb);
    this.asr_reader.on("data", this.on_asr_audio_cb);

    const text = await this.asr.speech_to_text();
    const audio = await this.tts.synthesize_speech(`You said: ${text}`);

    if(text.trim() === "quit")
    {
      await this.exit_dialogue();
      return this.failure_done("Test error exit");
    }
    else if(text.trim() === "goodbye")
    {
      const goodbye = await this.tts.synthesize_speech("goodbye");
      await this.player.play_audio(goodbye.audio);
      await this.exit_dialogue();
      return this.success_done();
    }

    this.asr_reader.off("data", this.on_asr_audio_cb);

    console.log(`You said: ${text}`);
    await this.player.play_audio(audio.audio);

    this.wakeword_reader.on("data", this.on_wakeword_audio_cb);
  }

  private async exit_dialogue(): Promise<void>
  {
    console.log("Exiting the dialogue...");
    this.wakeword_detector.stop_listening();
    this.listener.close();
    await this.tts.close();
    await this.asr.finish();
    console.log("Dialogue exited");
  }
}
