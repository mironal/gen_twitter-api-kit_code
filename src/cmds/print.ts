import { objectByPath } from "../helper"

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
    console.log(result)
  }
}
