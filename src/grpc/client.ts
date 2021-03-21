import * as grpc from "grpc";
import { Comment } from "../proto/songs_pb";
import { SongsClient } from "../proto/songs_grpc_pb";
import { prompt } from "inquirer";

async function live_chat(): Promise<void> {
  const client = new SongsClient(
    `localhost:${process.env.PORT}`,
    grpc.credentials.createInsecure()
  );

  const { name } = await prompt([
    {
      name: "name",
      message: "What is your name?"
    }
  ]);

  const stream = client.liveChat();
  return new Promise(async (resolve, reject) => {
    stream.on("data", (comment: Comment) => {
      console.log(`${comment.getUsername()}: ${comment.getBody()}\n`);
    });

    stream.on("end", resolve);
    stream.on("error", err => {
      console.error(`Captured error: ${err.message}`);
      reject(err);
    });

    while (true) {
      const answer = await prompt([
        {
          name: "message",
          message: "Type message:"
        }
      ]);

      const comment = new Comment();
      comment.setUsername(name);
      comment.setBody(answer.message);
      stream.write(comment);
    }
  });
}

export default live_chat;
