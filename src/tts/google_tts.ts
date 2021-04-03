import { TextToSpeech, AudioContent, Config } from "../tts/tts";
import { v1beta1, protos } from "@google-cloud/text-to-speech";

type GoogleTTSRequest = protos.google.cloud.texttospeech.v1beta1.ISynthesizeSpeechRequest;

export class GoogleTTS implements TextToSpeech {
  private client: v1beta1.TextToSpeechClient = new v1beta1.TextToSpeechClient();
  private config: Config = null;

  constructor(config: Config) {
    this.config = config;
  }

  async synthesize_speech(text: string): Promise<AudioContent> {
    const request: GoogleTTSRequest = {
      input: { text: text },
      voice: {
        languageCode: this.config.language_code,
        ssmlGender: this.config.gender
      },
      audioConfig: { audioEncoding: this.config.audio_encoding }
    };

    const [response] = await this.client.synthesizeSpeech(request);

    return {
      audio: response.audioContent,
      encoding: this.config.audio_encoding
    };
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
