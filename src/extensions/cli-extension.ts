import { GluegunToolbox } from "gluegun";

import serve from "../grpc/server";
import live_chat from "../grpc/client";

// add your CLI-specific functionality here, which will then be accessible
// to your commands
module.exports = (toolbox: GluegunToolbox) => {
  toolbox.serve = serve;
  toolbox.live_chat = live_chat;

  // enable this if you want to read configuration in from
  // the current folder's package.json (in a "awaker" property),
  // awaker.config.json, etc.
  // toolbox.config = {
  //   ...toolbox.config,
  //   ...toolbox.config.loadConfig("awaker", process.cwd())
  // }
};
