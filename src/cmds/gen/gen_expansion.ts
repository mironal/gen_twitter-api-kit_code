import { boolean, Infer, is, object, pattern, string } from "superstruct"
import { CodeGenerator } from "./code_generator"
import { GenUtil } from "./gen_utils"
import { enumArraySchema } from "./types"

const ExpansionParameter = object({
  name: pattern(string(), /expansions/),
  in: pattern(string(), /query/),
  description: string(),
  schema: enumArraySchema(),
  explode: boolean(),
  style: string(),
})

export type ExpansionParameterType = Infer<typeof ExpansionParameter>

export class ExpansionParameterGenerator
  implements CodeGenerator<ExpansionParameterType>
{
  canGenerate(openAPI: unknown): openAPI is ExpansionParameterType {
    return is(openAPI, ExpansionParameter)
  }
  generate(path: string, openAPI: ExpansionParameterType): string {
    const name = GenUtil.pathToEnumName(path)
    const enumValues = openAPI.schema.items.enum
    return `/// ${openAPI.description}
/// ${openAPI.name}
public enum ${name}: TwitterExpansionsParameterV2, Hashable {
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
`
  }
}
