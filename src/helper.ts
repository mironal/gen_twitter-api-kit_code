export const objectByPath = (object: any, path: string) => {
  const paths = path.split("/")
  return paths.reduce((result: any, path) => {
    return result[path]
  }, object)
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
