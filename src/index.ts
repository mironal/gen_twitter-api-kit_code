import fs from "fs"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { genCommand } from "./cmds/gen/gen"
import { printCommand } from "./cmds/print"

// ex) npm run dev -- gen components.parameters.DmEventExpansionsParameter

const args = yargs(hideBin(process.argv))
  .command("gen <path>", "Generate Swift Code", (yargs) => {
    yargs.positional("path", { type: "string" })
  })
  .command("print [path]", "Print", (yargs) => {
    yargs.positional("path", { type: "string" })
  })
  .parseSync()

const jsonPath = "./twitter_v2.json"
const TwitterAPIV2 = JSON.parse(fs.readFileSync(jsonPath, "utf-8"))

switch (args._[0]) {
  case "gen":
    if (typeof args.path == "string") {
      genCommand(TwitterAPIV2, { path: args.path })
    }
    break
  case "print":
    if (typeof args.path == "string" || typeof args.path == "undefined") {
      printCommand(TwitterAPIV2, { path: args.path })
    }
    break
}
