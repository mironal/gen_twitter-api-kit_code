import { capitalizeFirstLetter, snakeCaseToCamelCase } from "../../helper"
import { PATH_SEPARATOR } from "../const"

export const GenUtil = {
  toCaseLine: (enumName: string): string => {
    return `    case ${snakeCaseToCamelCase(enumName)}`
  },
  toStringValueLine: (enumName: string): string => {
    return `        case .${snakeCaseToCamelCase(
      enumName
    )}: return "${enumName}"`
  },
  toAllCaseLine: (enumName: string): string => {
    return `        .${snakeCaseToCamelCase(enumName)},`
  },
  pathToEnumName: (path: string): string => {
    const pathComponent = path.split(PATH_SEPARATOR)
    const last = pathComponent[pathComponent.length - 1]
    const name = `Twitter${last.replace("Parameter", "")}V2`
    return name
  },
  toOAuth20ScopeComment: (scopes: string[]): string | undefined => {
    if (scopes.length === 0) {
      return undefined
    }
    return `Required OAuth 2.0 scopes: ${scopes.join(", ")}`
  },
}
