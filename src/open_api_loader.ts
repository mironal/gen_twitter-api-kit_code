import fs from "fs"
import SwaggerClient from "swagger-client"
export async function load(path: string = "./twitter_v2.json") {
  const TwitterAPIV2 = JSON.parse(fs.readFileSync(path, "utf-8"))
  const ResolvedTwitterAPIV2 = (
    await SwaggerClient.resolve({
      spec: TwitterAPIV2,
    })
  ).spec as { [index: string]: any }
  return ResolvedTwitterAPIV2
}
