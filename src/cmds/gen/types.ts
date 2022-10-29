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
} from "superstruct"

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
