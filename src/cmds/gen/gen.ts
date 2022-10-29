import { objectByPath } from "../../helper"
import { CodeGenerator } from "./code_generator"
import { ExpansionParameterGenerator } from "./gen_expansion"
import { FieldGenerator } from "./gen_fields"

const generators: CodeGenerator<unknown>[] = [
  new FieldGenerator(),
  new ExpansionParameterGenerator(),
]

export async function genCommand(
  openAPI: { [index: string]: unknown },
  params: { path: string }
) {
  const { path } = params
  const result = objectByPath(openAPI, path)

  for (const generator of generators) {
    if (generator.canGenerate(result)) {
      console.log(generator.generate(path, result))
      return
    }
  }
  console.warn("No match generator for", path)
}
