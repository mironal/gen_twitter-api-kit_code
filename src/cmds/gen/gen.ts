import { objectByPath } from "../../helper"
import { CodeGenerator } from "./code_generator"
import { FieldGenerator } from "./gen_fields"

const generators: [CodeGenerator<any>] = [new FieldGenerator()]

export async function genCommand(
  openAPI: { [index: string]: unknown },
  params: { path: string }
) {
  const { path } = params
  const result = objectByPath(openAPI, path)

  for (const generator of generators) {
    if (generator.canGenerate(result)) {
      console.log(generator.generate(path, result))
      break
    }
  }
}
