import { Readable } from "stream";

export interface Config {
  readonly sampleRateHertz?: number;
  readonly threshold?: number;
  readonly channels?: number;
  readonly silence?: number;
  readonly audioType?: string;
  readonly keepSilence?: boolean;
  readonly recorder?: string;
  readonly device?: string | null;
}

export interface AudioSource {
  configure(config: Config): void;
  add_reader(): Readable;
  close(): void;
}
