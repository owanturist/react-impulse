declare module "esbuild-plugin-replace-regex" {
  import type { Options } from "tsup"

  type Plugin = Required<Options>["esbuildPlugins"][0]

  export function replace(options?: {
    filter?: RegExp
    loader?: string
    patterns?: Array<[RegExp, string]>
    encoding?: string
  }): Plugin
}
