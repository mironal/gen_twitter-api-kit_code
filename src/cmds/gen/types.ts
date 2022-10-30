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
} from "superstruct"

export const SecuritySchema = record(
  enums(["BearerToken", "OAuth2UserToken", "UserToken"]),
  array(string())
)
export type SecuritySchemaType = Infer<typeof SecuritySchema>
export const securitySchema = () =>
  define<SecuritySchemaType>("Security", (value) => is(value, SecuritySchema))

export const Schema = object({
  type: enums(["object", "array", "integer", "string"]),
  minimum: optional(number()),
  maximum: optional(number()),
  minItems: optional(number()),
  uniqueItems: optional(boolean()),
  items: optional(
    object({
      type: enums(["string"]),
      enum: array(string()),
    })
  ),
  format: optional(string()),
  default: optional(any()),
  example: optional(any()),
  enum: optional(array(string())),
  description: optional(string()),
  maxLength: optional(number()),
  minLength: optional(number()),
  pattern: optional(string()),
  properties: optional(object()),
  required: optional(array()),
  $$ref: optional(string()), // Only parsed object
})

export type SchemaType = Infer<typeof Schema>
export const schema = () =>
  define<SchemaType>("Schema", (value) => is(value, Schema))

export const RequestBodyObject = object({
  content: object({
    "application/json": object({ schema: schema() }),
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
  schema: schema(),
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
