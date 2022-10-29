export const objectByPath = (object: any, path: string) => {
  const paths = path.split("/")
  return paths.reduce((result: any, path) => {
    return result[path]
  }, object)
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// dm_conversation_id -> dmConversationID
export function snakeCaseToCamelCase(string: string): string {
  return string
    .split("_")
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
