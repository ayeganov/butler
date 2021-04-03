type VoiceGender = "MALE" | "FEMALE" | "NEUTRAL";
type Encoding = "AUDIO_ENCODING_UNSPECIFIED" | "LINEAR16" | "OGG_OPUS" | "MP3";

export interface Config {
  readonly gender: VoiceGender;
  readonly language_code: string;
  readonly audio_encoding: Encoding;
}

export interface AudioContent {
  readonly audio: Uint8Array | string;
  readonly encoding: Encoding;
}

export interface TextToSpeech {
  synthesize_speech(text: string): Promise<AudioContent>;
  close(): Promise<void>;
}
