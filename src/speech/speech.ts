/**
 * Declare the interface required to convert audio signal to text
 */

/*
 * Grab what Google supports for now.
 */
type Encoding =
  | "ENCODING_UNSPECIFIED"
  | "LINEAR16"
  | "FLAC"
  | "MULAW"
  | "AMR"
  | "AMR_WB"
  | "OGG_OPUS"
  | "SPEEX_WITH_HEADER_BYTE"
  | "MP3";

export interface Config {
  readonly encoding: Encoding;
  readonly hz_rate: number;
  readonly language_code: string;
}

export interface AudioToText {
  speech_to_text(): Promise<string>;
  consume_audio_chunk(chunk: Uint8Array): void;
  finish(): Promise<void>;
}
