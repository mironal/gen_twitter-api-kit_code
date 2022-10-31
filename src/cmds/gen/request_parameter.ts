import { capitalizeFirstLetter, snakeCaseToCamelCase } from "../../helper"
import {
  ParameterSchema,
  ParameterSchemaType,
  RequestBodyAnyOfSchema,
  RequestBodyObjectType,
  Schema,
  SchemaType,
} from "./types"
import { inspect } from "util"
import { is } from "superstruct"

export type RequestParameterDescriptor = {
  propertyComment: string
  propertyName: string
  swiftType: string
  isOptional: boolean
  parameterType: string
  parameterName: string
  in: "query" | "path" | "json-body"
  definedType: boolean
}
export function toRequestParameterDescriptor(
  parameter: ParameterSchemaType
): RequestParameterDescriptor
export function toRequestParameterDescriptor(
  parameter: RequestBodyObjectType["content"]["application/json"] | undefined
): RequestParameterDescriptor[]
export function toRequestParameterDescriptor(
  parameter:
    | ParameterSchemaType
    | RequestBodyObjectType["content"]["application/json"]
    | undefined
) {
  if (is(parameter, ParameterSchema)) {
    return parameterSchemeToRequestParameterDescriptor(parameter)
  } else {
    return requestBodyToRequestParameterDescriptor(parameter?.schema)
  }
}

function parameterSchemeToRequestParameterDescriptor(
  parameter: ParameterSchemaType
): RequestParameterDescriptor {
  const swiftType = toSwiftType(parameter)
  return {
    propertyComment: parameter.description,
    propertyName: snakeCaseToCamelCase(parameter.name),
    swiftType,
    isOptional: !parameter.required,
    parameterType: parameter.schema.type,
    parameterName: parameter.name,
    in: parameter.in,
    definedType: isDefinedType(swiftType),
  }
}

type NamedSchemaType = SchemaType & { parameterName: string }
function flattenProperties(
  properties: SchemaType["properties"],
  requiredProperties: string[]
): NamedSchemaType[] {
  if (!properties) {
    return []
  }
  return Object.entries(properties)
    .map(([parameterName, prop]) => {
      if (is(prop, RequestBodyAnyOfSchema)) {
        return prop.anyOf.flatMap((p) => {
          return flattenProperties({ [parameterName]: p }, requiredProperties)
        })
      } else {
        if (prop.properties) {
          return flattenProperties(prop.properties, requiredProperties)
        }
        const schema: NamedSchemaType = {
          parameterName,
          ...prop,
          required: requiredProperties,
        }
        return [schema]
      }
    })
    .flat()
}

function requestBodyToRequestParameterDescriptor(
  parameter:
    | RequestBodyObjectType["content"]["application/json"]["schema"]
    | undefined
): RequestParameterDescriptor[] {
  if (!parameter) {
    return []
  }
  const flattenParameters = (() => {
    return flattenProperties(
      { $$: parameter },
      is(parameter, Schema) ? parameter.required ?? [] : []
    )
  })()
  const descriptors: RequestParameterDescriptor[] = flattenParameters
    .map((prop) => {
      const swiftType = toSwiftType({
        name: prop.parameterName,
        schema: prop,
        $$ref: prop.$$ref,
        required: prop.required?.includes(prop.parameterName),
      })
      const descriptor: RequestParameterDescriptor = {
        propertyComment: prop.description ?? "",
        propertyName: snakeCaseToCamelCase(prop.parameterName),
        swiftType,
        isOptional: !(prop.required ?? []).includes(prop.parameterName),
        parameterType: prop.type,
        parameterName: prop.parameterName,
        in: "json-body",
        definedType: isDefinedType(swiftType),
      }
      return descriptor
    })
    .flat()
    .sort((a, b) => {
      // Non null to head
      if (a.isOptional && !b.isOptional) {
        return 1
      }
      if (!a.isOptional && b.isOptional) {
        return -1
      }
      return 0
    })
    .reduce((result, current) => {
      // Filter duplicated descriptor.
      const descriptor = result.find(
        (d) => d.propertyName === current.propertyName
      )
      if (!descriptor) {
        return [...result, current]
      }
      if (descriptor.isOptional === false && current.isOptional) {
        // Prefer Optional parameter
        return result.map((d) => {
          if (d.propertyName === current.propertyName) {
            return current
          }
          return d
        })
      }
      return result
    }, [] as RequestParameterDescriptor[])
  return descriptors
}

function isDefinedType(swiftType: string): boolean {
  const defined = ["String", "Int"]
  return defined.some((value) => swiftType.includes(value))
}

function toSwiftType(
  parameter: Pick<ParameterSchemaType, "required" | "schema" | "name" | "$$ref">
): string {
  const optionalString = !!parameter.required ? "" : "?"
  if (parameter.schema.type === "string") {
    if (parameter.schema.enum) {
      return simpleNameToType(parameter.name)
    }
    return `String${optionalString}`
  }
  if (parameter.schema.type === "integer") {
    return `Int${optionalString}`
  }

  if (
    parameter.name === "event_types" &&
    parameter.schema.items?.enum?.includes("MessageCreate")
  ) {
    return `Set<TwitterDirectMessageEventTypeV2>${optionalString}`
  }
  // Array or Set
  if (parameter.schema.type === "array") {
    if (parameter.$$ref) {
      const type = mapRefToSwiftType(parameter.$$ref)
      if (type) {
        return `Set<${type}>${optionalString}`
      }
    }
    if (parameter.schema.items?.type === "string") {
      if (parameter.schema.items?.$$ref?.endsWith("UserId")) {
        return `[String]${optionalString}`
      }
      return `Set<${simpleNameToType(parameter.name)}>${optionalString}`
    }

    if (parameter.schema.items?.properties) {
      const props = Object.entries(parameter.schema.items.properties)
      // Simple array of string
      if (props.length === 1) {
        if (is(props[0][1], Schema) && props[0][1].type === "string") {
          return `[String]${optionalString}`
        }
      }
    }
  }

  console.warn(
    "Can not resolve type:",
    inspect(parameter, { depth: null, colors: true })
  )
  return `Can not resolve: ${parameter.name}`
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

const simpleNameToType = (name: string): string => {
  const type = capitalizeFirstLetter(snakeCaseToCamelCase(name))
  return type.endsWith("s") ? type.slice(0, -1) : type
}
