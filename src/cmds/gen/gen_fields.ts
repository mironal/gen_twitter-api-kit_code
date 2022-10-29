import { Infer, is, pattern, string, object, boolean } from "superstruct"
import { snakeCaseToCamelCase } from "../../helper"
import { CodeGenerator } from "./code_generator"
import { GenUtil } from "./gen_utils"
import { enumArraySchema } from "./types"

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

function gen(path: string, param: FieldParameterType): string {
  const name = GenUtil.pathToEnumName(path)
  const enumValues = param.schema.items.enum
  return `/// ${param.description}
/// ${param.name}
public enum ${name}: TwitterAPIv2RequestParameter, Hashable {
${enumValues.map(GenUtil.toCaseLine).join("\n")}
    case other(String)

    public var stringValue: String {
        switch self {
${enumValues.map(GenUtil.toStringValueLine).join("\n")}
        case .other(let string): return string
        }
    }

    public static let all: Set<Self> = [
${enumValues.map(GenUtil.toAllCaseLine).join("\n")}
    ]
}

extension Set where Element == ${name} {
    func bind(param: inout [String: Any]) {
        param["${param.name}"] = commaSeparatedString
    }
}
`
}
