import { array, assert, Infer, is, object, optional, string } from "superstruct"
import { inspect } from "util"
import { capitalizeFirstLetter, lowerCaseFirstLetter } from "../../helper"
import { CodeGenerator } from "./code_generator"
import { GenUtil } from "./gen_utils"
import {
  parameterSchema,
  ParameterSchemaType,
  requestBodyObject,
  securitySchema,
} from "./types"

const RequestSchema = object({
  security: array(securitySchema()),
  tags: array(string()),
  summary: string(),
  description: string(),
  operationId: string(),
  parameters: array(parameterSchema()),
  requestBody: optional(requestBodyObject()),
  responses: object(),
  externalDocs: optional(object({ url: string() })),
  __originalOperationId: string(), // Only parsed
})

export type RequestSchemeType = Infer<typeof RequestSchema>

export class RequestGenerator implements CodeGenerator<RequestSchemeType> {
  canGenerate(openAPI: unknown): openAPI is RequestSchemeType {
    assert(openAPI, RequestSchema)
    return is(openAPI, RequestSchema)
  }
  generate(path: string, openAPI: RequestSchemeType): string {
    const paths = path.split(".")
    const method = paths[2]
    const comments = [
      openAPI.description,
      openAPI.externalDocs,
      GenUtil.toOAuth20ScopeComment(
        openAPI.security.find((v) => v.OAuth2UserToken)?.OAuth2UserToken ?? []
      ),
    ].filter((v) => v)
    const name = `${capitalizeFirstLetter(openAPI.operationId)}RequestV2`

    const pathParameters = openAPI.parameters.filter((v) => v.in === "path")
    const queryParameters = openAPI.parameters.filter((v) => v.in === "query")
    const allParameters = [...pathParameters, ...queryParameters]

    const properties = allParameters
      .map((p) => {
        return [
          `    /// ${p.description}`,
          `    public let ${GenUtil.toPropertyName(p.name)}: ${toSwiftType(p)}`,
        ]
      })
      .flat()

    const innerTypes = [...pathParameters, ...queryParameters]
      .map(toInnerType)
      .filter((v) => v)

    const requestPath = toRequestPath(paths[1], pathParameters)
    return `import Foundation

/// ${comments.join("\n/// ")}
open class ${name}: TwitterAPIRequest {
${innerTypes.length === 0 ? "" : innerTypes.join("\n") + "\n"}
${properties.join("\n")}

    public var method: HTTPMethod {
        return .${method}
    }

    public var path: String {
        return "${requestPath}"
    }

    open var parameters: [String: Any] {
        var p = [String: Any]()
        ${queryParameters.map((p) => `${toBindLine(p)}`).join("\n        ")}
        return p
    }

    public init(
        ${allParameters.map((p) => toInitArgLine(p)).join(",\n        ")}
    ) {
        ${allParameters.map((p) => toInitLine(p)).join("\n        ")}
    }
}
`
  }
}

const toRequestPath = (
  path: string,
  pathParameters: ParameterSchemaType[]
): string => {
  const result = pathParameters.reduce((path, param) => {
    return path.replace(
      `{${param.name}}`,
      `\\(${GenUtil.toPropertyName(param.name)})`
    )
  }, path)
  return result
}

const toInitArgLine = (parameter: ParameterSchemaType): string => {
  const defaultArg = !!parameter.required ? "" : " = .none"
  return `${GenUtil.toPropertyName(parameter.name)}: ${toSwiftType(
    parameter
  )}${defaultArg}`
}

const toInitLine = (parameter: ParameterSchemaType): string => {
  const propertyName = GenUtil.toPropertyName(parameter.name)
  return `self.${propertyName} = ${propertyName}`
}

const toBindLine = (parameter: ParameterSchemaType): string => {
  if (["integer", "string"].includes(parameter.schema.type)) {
    return `${GenUtil.toPropertyName(parameter.name)}.map { p["${
      parameter.name
    }"] = $0 }`
  }
  const optionalString = !!parameter.required ? "" : "?"
  return `${GenUtil.toPropertyName(
    parameter.name
  )}${optionalString}.bind(param: &p)`
}

const mapRefToSwiftType = (ref: string) => {
  const field = ref.match(/#\/components\/parameters\/(.+)FieldsParameter/)?.[1]
  if (typeof field == "string") {
    return `Twitter${field}FieldsV2`
  }

  const expansion = ref.match(
    /#\/components\/parameters\/(.+)ExpansionsParameter/
  )?.[1]
  if (typeof expansion === "string") {
    return `Twitter${expansion}ExpansionsV2`
  }
}

function toSwiftType(parameter: ParameterSchemaType): string {
  const optionalString = !!parameter.required ? "" : "?"
  if (parameter.schema.type === "string") {
    return `String${optionalString}`
  }
  if (parameter.schema.type === "integer") {
    return `Int${optionalString}`
  }

  if (
    parameter.name === "event_types" &&
    parameter.schema.items?.enum.includes("MessageCreate")
  ) {
    return `Set<TwitterDirectMessageEventTypeV2>${optionalString}`
  }
  if (parameter.schema.type === "array") {
    if (parameter.$$ref) {
      const type = mapRefToSwiftType(parameter.$$ref)
      return `Set<${type}>${optionalString}`
    } else if (parameter.schema.items?.type === "string") {
      return `Set<${GenUtil.simpleNameToType(parameter.name)}>${optionalString}`
    }
  }

  console.warn(inspect(parameter, { depth: null, colors: true }))
  return `Can not resolve: ${parameter.name}`
}

function toInnerType(parameter: ParameterSchemaType): string | null {
  if (
    parameter.$$ref ||
    ["string", "integer"].includes(parameter.schema.type) ||
    ["event_types"].includes(parameter.name)
  ) {
    return null
  }

  if (
    parameter.schema.type === "array" &&
    parameter.schema.items?.type === "string"
  ) {
    return buildStringEnum(
      parameter.name,
      parameter.schema.items.enum,
      parameter.description
    )
  }
  return `Can not build inner type. Please write yourself. (${parameter.name})`
}

function buildStringEnum(
  name: string,
  items: string[],
  description: string,
  level: number = 4
): string {
  const indent = " ".repeat(level)
  return [
    `/// ${description}`,
    `public enum ${GenUtil.simpleNameToType(name)}: String {`,
    ...items.map(
      (item) => `    case ${lowerCaseFirstLetter(item)} = "${item}"`
    ),
    "}",
  ]
    .map((line) => `${indent}${line}`)
    .join("\n")
}
