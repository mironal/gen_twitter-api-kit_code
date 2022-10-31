import { array, assert, Infer, is, object, optional, string } from "superstruct"
import { capitalizeFirstLetter } from "../../helper"
import { CodeGenerator } from "./code_generator"
import { GenUtil } from "./gen_utils"
import {
  RequestParameterDescriptor,
  toRequestParameterDescriptor,
} from "./request_parameter"
import { parameterSchema, requestBodyObject, securitySchema } from "./types"

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
    const name = toClassName(method, openAPI.operationId)

    const pathParameters = openAPI.parameters
      .filter((v) => v.in === "path")
      .map((p) => toRequestParameterDescriptor(p))
    const queryParameters = openAPI.parameters
      .filter((v) => v.in === "query")
      .map((p) => toRequestParameterDescriptor(p))
    const jsonParameters = toRequestParameterDescriptor(
      openAPI.requestBody?.content["application/json"]
    )

    const allParameterDescriptors: RequestParameterDescriptor[] = [
      ...pathParameters,
      ...queryParameters,
      ...jsonParameters,
    ]

    const properties = allParameterDescriptors
      .map((d) => {
        return [
          `    /// ${d.propertyComment}`,
          `    public let ${d.propertyName}: ${d.swiftType}`,
        ]
      })
      .flat()

    const hasJsonBody = jsonParameters.length > 0
    const requestPath = toRequestPath(paths[1], pathParameters)
    return `import Foundation

/// ${comments.join("\n/// ")}
open class ${name}: TwitterAPIRequest {

${properties.join("\n")}

    public var method: HTTPMethod {
        return .${method}
    }

    public var path: String {
        return "${requestPath}"
    }
${
  hasJsonBody
    ? `
    public var bodyContentType: BodyContentType {
      return .json
    }
`
    : ""
}
    open var parameters: [String: Any] {
        var p = [String: Any]()
        ${[...queryParameters]
          .map((p) => `${toBindLine(p)}`)
          .join("\n        ")}${
      hasJsonBody
        ? `#warning("Please write it yourself as it is difficult to generate automatically.")`
        : ""
    }
        return p
    }

    public init(
        ${allParameterDescriptors
          .map((p) => toInitArgLine(p))
          .join(",\n        ")}
    ) {
        ${allParameterDescriptors.map((p) => toInitLine(p)).join("\n        ")}
    }
}
`
  }
}

const toRequestPath = (
  path: string,
  pathParameters: RequestParameterDescriptor[]
): string => {
  const result = pathParameters.reduce((path, param) => {
    return path.replace(`{${param.parameterName}}`, `\\(${param.propertyName})`)
  }, path)
  return result
}

const toInitArgLine = ({
  swiftType,
  propertyName,
  isOptional,
}: RequestParameterDescriptor): string => {
  const defaultArg = isOptional ? " = .none" : ""
  return `${propertyName}: ${swiftType}${defaultArg}`
}

const toInitLine = ({ propertyName }: RequestParameterDescriptor): string => {
  return `self.${propertyName} = ${propertyName}`
}

const toBindLine = ({
  propertyName,
  swiftType,
  parameterName,
  parameterType,
  isOptional,
}: RequestParameterDescriptor): string => {
  if (["integer", "string"].includes(parameterType)) {
    return `${propertyName}.map { p["${parameterName}"] = $0 }`
  }

  if (swiftType === "[String]?") {
    return `${propertyName}.map { p["${parameterName}"] = $0.joined(separator: ",") }`
  }
  const optionalString = isOptional ? "?" : ""
  return `${propertyName}${optionalString}.bind(param: &p)`
}

function toClassName(method: string, operationId: string): string {
  const prefix: string = (() => {
    if (operationId.startsWith(method)) {
      return ""
    }
    return method
  })()
  const operation = capitalizeFirstLetter(
    operationId
      // for Direct Messsage
      .replace(/EventIdCreate$/, "")
      .replace(/IdCreate$/, "")
  )

  const name = capitalizeFirstLetter(`${prefix}${operation}RequestV2`)
  return name
}
