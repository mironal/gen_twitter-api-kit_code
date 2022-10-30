import fs from "fs"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { genCommand } from "./cmds/gen/gen"
import { printCommand } from "./cmds/print"
import { load } from "./open_api_loader"

// ex) npm run dev -- gen components.parameters.DmEventExpansionsParameter

async function main() {
  const args = yargs(hideBin(process.argv))
    .command("gen <path>", "Generate Swift Code", (yargs) => {
      yargs.positional("path", { type: "string" })
    })
    .command("print [path]", "Print", (yargs) => {
      yargs.positional("path", { type: "string" })
    })
    .parseSync()
  const twitterAPI = await load()

  switch (args._[0]) {
    case "gen":
      if (typeof args.path == "string") {
        genCommand(twitterAPI, { path: args.path })
      }
      break
    case "print":
      if (typeof args.path == "string" || typeof args.path == "undefined") {
        printCommand(twitterAPI, { path: args.path })
      }
      break
  }
}
main().catch(console.error)
