import { GluegunCommand } from "gluegun";
import { Dialogue } from "../dialogue/dialogue";


const command: GluegunCommand = {
  name: "dialogue",
  run: async toolbox => {
    return new Promise(async (resolve, reject) => {
      try
      {
        const dialogue = new Dialogue("computer");
        console.log("Ready");
        await dialogue.start_dialogue();
        console.log("Dialogue finished");
        resolve();
      }
      catch(error)
      {
        console.log("Error got hit");
        console.error(error);
        reject(error);
      }
    });
  }
};


module.exports = command;
