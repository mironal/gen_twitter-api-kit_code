import { inspect } from "util"
import { PATH_SEPARATOR } from "./cmds/const"

export const objectByPath = (object: any, path: string) => {
  const paths = path.split(PATH_SEPARATOR)
  return paths.reduce((result: any, p) => {
    const obj = result[p]
    if (obj === undefined) {
      throw new Error(
        `Object is not include in "${path}": ${inspect(result, {
          depth: 0,
          compact: true,
        })}`
      )
    }
    return obj
  }, object)
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
export function lowerCaseFirstLetter(string: string): string {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

// dm_conversation_id -> dmConversationID
// attachments.poll_ids -> attachmentsPollIDs
export function snakeCaseToCamelCase(string: string): string {
  return string
    .split(/[_\.]/)
    .map((token, index) => {
      if (index == 0) {
        return token
      }
      if (token == "id") {
        return "ID"
      }
      if (token == "ids") {
        return "IDs"
      }
      return capitalizeFirstLetter(token)
    })
    .join("")
}
