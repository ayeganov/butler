import { AudioSource, Config } from "../audio/audio_source";
import { Readable } from "stream";
import { record, Recording } from "node-record-lpcm16";

export class Microphone implements AudioSource {
  private listener: Recording;
  private is_running: boolean = false;

  configure(config: Config): void {
    this.listener = record(config);
    this.is_running = true;
  }

  add_reader(): Readable {
    return this.listener.stream();
  }

  close(): void {
    if (this.is_running) {
      this.listener.stop();
    }
  }
}
