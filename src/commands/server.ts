import { GluegunCommand } from "gluegun";

const command: GluegunCommand = {
  name: "server",
  run: async toolbox => {
    const { print, serve } = toolbox;

    print.info("Welcome to chat server, you are serving chat clients");

    await serve();
  }
};

module.exports = command;
