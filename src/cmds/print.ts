import { objectByPath } from "../helper"
import { inspect } from "util"

export async function printCommand(
  openAPI: { [index: string]: unknown },
  params: { path?: string }
) {
  const { path } = params
  if (path == "*" || path == undefined) {
    console.log(openAPI)
  } else {
    console.log("Path:", path)
    const result = objectByPath(openAPI, path)
    console.log(inspect(result, { depth: null, colors: true }))
  }
}
