import * as grpc from "grpc";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";

import { ISongsServer, SongsService } from "../proto/songs_grpc_pb";
import { Comment, Song } from "../proto/songs_pb";

type ListenerFn = (c: Comment) => void;

const listeners: ListenerFn[] = [];

export function register_listener(fn: ListenerFn): void {
  listeners.push(fn);
}

export function add_comment(comment: Comment): void {
  listeners.map(listener => listener(comment));
}

class SongsServer implements ISongsServer {
  getSong(
    call: grpc.ServerUnaryCall<Empty>,
    callback: grpc.sendUnaryData<Song>
  ): void {
    console.log("Get song");
    const newSong = new Song();
    callback(null, newSong);
  }

  addSongs(
    call: grpc.ServerReadableStream<Song>,
    callback: grpc.sendUnaryData<Empty>
  ): void {
    console.log(`${new Date().toISOString()}    addSongs`);
    call.on("data", (song: Song) => {
      console.log(`Adding song ${song.getTitle()}`);
    });

    call.on("end", () => callback(null, new Empty()));
  }

  async getChat(call: grpc.ServerWritableStream<Song, Comment>): Promise<void> {
    console.log(`${new Date().toISOString()}    getChat`);
    call.end();
  }

  liveChat(call: grpc.ServerDuplexStream<Comment, Comment>): void {
    console.log(`${new Date().toISOString()}   live chat`);
    register_listener(comment => call.write(comment));
    call.on("data", (comment: Comment) => {
      add_comment(comment);
    });

    call.on("end", () => call.end());
  }
}

function serve(): void {
  const server = new grpc.Server();
  server.addService(SongsService, new SongsServer());
  server.bindAsync(
    `localhost:${process.env.PORT}`,
    grpc.ServerCredentials.createInsecure(),

    (err, port) => {
      if (err) {
        throw err;
      }

      console.log(`Listening on ${port}`);
      server.start();
    }
  );
}

export default serve;
