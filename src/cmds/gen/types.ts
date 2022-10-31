import {
  Infer,
  number,
  is,
  pattern,
  string,
  object,
  boolean,
  define,
  array,
  record,
  enums,
  optional,
  any,
  union,
  lazy,
  Describe,
} from "superstruct"

export const SecuritySchema = record(
  enums(["BearerToken", "OAuth2UserToken", "UserToken"]),
  array(string())
)
export type SecuritySchemaType = Infer<typeof SecuritySchema>
export const securitySchema = () =>
  define<SecuritySchemaType>("Security", (value) => is(value, SecuritySchema))

export type SchemaType = {
  type: "object" | "array" | "integer" | "string" | "boolean"
  minimum?: number
  maximum?: number
  maxItems?: number
  minItems?: number
  uniqueItems?: boolean
  items?: SchemaType
  format?: string
  default?: any
  example?: any
  enum?: string[]
  description?: string
  maxLength?: number
  minLength?: number
  pattern?: string
  properties?: {
    [index: string]: SchemaType | RequestBodyAnyOfSchemaType
  }
  required?: string[]
  additionalProperties?: boolean
  $$ref?: string // Only parsed object
}

export const Schema: Describe<SchemaType> = object({
  type: enums(["object", "array", "integer", "string", "boolean"]),
  minimum: optional(number()),
  maximum: optional(number()),
  maxItems: optional(number()),
  minItems: optional(number()),
  uniqueItems: optional(boolean()),
  items: optional(lazy(() => Schema)),
  format: optional(string()),
  default: optional(any()),
  example: optional(any()),
  enum: optional(array(string())),
  description: optional(string()),
  maxLength: optional(number()),
  minLength: optional(number()),
  pattern: optional(string()),
  properties: optional(
    record(
      string(),
      lazy(() => union([Schema, RequestBodyAnyOfSchema]))
    )
  ),
  required: optional(array(string())),
  additionalProperties: optional(boolean()),
  $$ref: optional(string()), // Only parsed object
})

export const RequestBodyAnyOfSchema = object({
  anyOf: array(Schema),
  $$ref: string(),
})

export type RequestBodyAnyOfSchemaType = Infer<typeof RequestBodyAnyOfSchema>

export const RequestBodyObject = object({
  content: object({
    "application/json": object({
      schema: union([RequestBodyAnyOfSchema, Schema]),
    }),
  }),
  required: optional(boolean()),
})

export type RequestBodyObjectType = Infer<typeof RequestBodyObject>
export const requestBodyObject = () =>
  define<RequestBodyObjectType>("RequestBodyObject", (value) =>
    is(value, RequestBodyObject)
  )

export const ParameterSchema = object({
  name: string(),
  in: enums(["query", "path"]),
  description: string(),
  required: optional(boolean()),
  style: string(),
  schema: Schema,
  explode: optional(boolean()),
  example: optional(any()),
  $$ref: optional(string()),
})
export type ParameterSchemaType = Infer<typeof ParameterSchema>
export const parameterSchema = () =>
  define<ParameterSchemaType>("ParameterSchema", (value) =>
    is(value, ParameterSchema)
  )

export const EnumArraySchema = object({
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

export type EnumArraySchemaType = Infer<typeof EnumArraySchema>

export const enumArraySchema = () =>
  define<EnumArraySchemaType>("Schema", (value) => is(value, EnumArraySchema))
