import { GluegunCommand } from "gluegun";

const command: GluegunCommand = {
  name: "chat",
  description: "Start chatting with another person",
  run: async toolbox => {
    const { print, live_chat } = toolbox;

    print.info("Welcome to live chat");

    await live_chat();
  }
};

module.exports = command;
