import { Schema } from "inspector"
import {
  assert,
  Infer,
  number,
  is,
  pattern,
  string,
  object,
  boolean,
  define,
  array,
} from "superstruct"
import { capitalizeFirstLetter, snakeCaseToCamelCase } from "../../helper"
import { CodeGenerator } from "./code_generator"

const EnumArraySchema = object({
  type: pattern(string(), /array/),
  description: string(),
  minItems: number(),
  uniqueItems: boolean(),
  items: object({
    type: string(),
    enum: array(string()),
  }),
  example: array(string()),
})

type EnumArraySchemaType = Infer<typeof EnumArraySchema>

const enumArraySchema = () =>
  define<EnumArraySchemaType>("Schema", (value) => is(value, EnumArraySchema))

const FieldParameter = object({
  name: pattern(string(), /.+\.fields$/),
  in: pattern(string(), /query/),
  description: string(),
  required: boolean(),
  schema: enumArraySchema(),
  explode: boolean(),
  style: string(),
})

type FieldParameterType = Infer<typeof FieldParameter>

export class FieldGenerator implements CodeGenerator<FieldParameterType> {
  canGenerate(openAPI: unknown): openAPI is FieldParameterType {
    return is(openAPI, FieldParameter)
  }

  generate(path: string, openAPI: FieldParameterType): string {
    return gen(path, openAPI)
  }
}

function fieldParameterEnumName(path: string): string {
  const pathComponent = path.split("/")
  const last = pathComponent[pathComponent.length - 1]
  const name = `Twitter${last.replace("Parameter", "")}V2`
  return name
}

function gen(path: string, param: FieldParameterType): string {
  const name = fieldParameterEnumName(path)
  const enumValues = param.schema.items.enum
  return `/// ${param.description}
/// ${param.name}
public enum ${name}: TwitterAPIv2RequestParameter, Hashable {
${enumValues
  .map((value) => `    case ${snakeCaseToCamelCase(value)}`)
  .join("\n")}
    case other(String)

    public var stringValue: String {
        switch self {
${enumValues
  .map(
    (value) => `        case .${snakeCaseToCamelCase(value)}: return "${value}"`
  )
  .join("\n")}
        case .other(let string): return string
        }
    }

    public static let all: Set<Self> = [
${enumValues
  .map((value) => `        .${snakeCaseToCamelCase(value)},`)
  .join("\n")}
    ]
}

extension Set where Element == ${name} {
    func bind(param: inout [String: Any]) {
        param["${param.name}"] = commaSeparatedString
    }
}
`
}
