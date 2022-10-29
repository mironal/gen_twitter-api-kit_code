export interface CodeGenerator<T> {
  canGenerate(openAPI: unknown): openAPI is T
  generate(path: string, openAPI: T): string
}
