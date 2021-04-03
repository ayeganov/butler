import { AudioToText, Config } from "./speech";
import * as Pumpify from "pumpify";
import { v1p1beta1, protos } from "@google-cloud/speech";

type GoogleConfig = protos.google.cloud.speech.v1p1beta1.IStreamingRecognitionConfig;
type GoogleStreamingResponse = protos.google.cloud.speech.v1p1beta1.IStreamingRecognizeResponse;
type GoogleResult = protos.google.cloud.speech.v1p1beta1.IStreamingRecognitionResult;

type Resolve = (value?: string | PromiseLike<string>) => void;
type Reject = (reason?: string) => void;

export class GoogleSpeech implements AudioToText {
  private client: v1p1beta1.SpeechClient = new v1p1beta1.SpeechClient();
  private config: Config = null;
  private recognize_stream: Pumpify = null;

  constructor(config: Config) {
    this.config = config;
  }

  public consume_audio_chunk(chunk: Uint8Array): void {
    if (this.recognize_stream !== null) {
      this.recognize_stream.write(chunk);
    }
  }

  public async finish(): Promise<void> {
    if (this.recognize_stream !== null) {
      return new Promise((resolve, reject) => {
        this.recognize_stream.end(resolve);
      });
    }

    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  public async speech_to_text(): Promise<string> {
    const config: GoogleConfig = {
      interimResults: true,
      config: {
        encoding: this.config.encoding,
        sampleRateHertz: this.config.hz_rate,
        languageCode: this.config.language_code
      }
    };

    this.recognize_stream = this.client.streamingRecognize(config);

    return new Promise(async (resolve: Resolve, reject: Reject) => {
      this.recognize_stream.on("data", (results: GoogleStreamingResponse) => {
        if (results.error) {
          reject(results.error.message);
          return;
        }

        this.handle_result(results.results, resolve, reject);
      });

      this.recognize_stream.on("error", (error: Error) => {
        reject(error.message);
      });
    });
  }

  private handle_result(
    results: GoogleResult[],
    resolve: Resolve,
    reject: Reject
  ) {
    const got_transcripts: boolean = results.length > 0;
    if (!got_transcripts) {
      reject("Received no results from Google Speech");
    }

    if (got_transcripts && results[0].isFinal) {
      resolve(results[0].alternatives[0].transcript);
    } else {
      let i = 0;
      for (const result of results) {
        ++i;
        if (result.stability > 0.7) {
          for (const trans of result.alternatives) {
            console.info(`${i}: ${trans.transcript}`);
          }
        }
      }
    }
  }
}
