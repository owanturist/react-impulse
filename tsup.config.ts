import { minify } from "terser"
import { type Options, defineConfig } from "tsup"

// Inspired by https://github.com/egoist/tsup/blob/692c112ac83f463d0be200253466c163c7cee36c/src/plugins/terser.ts
const manglePlugin: Required<Options>["plugins"][0] = {
  name: "terser-mangle",
  renderChunk: async function (code, info) {
    if (!/\.(c|m)?js$/.test(info.path)) return

    try {
      const minifiedOutput = await minify(code, {
        compress: false,
        output: {
          beautify: true,
          comments: "all",
          preserve_annotations: true,
        },
        mangle: {
          nth_identifier: {
            // by returning null it prevents undesired names mangling (ex: function arguments)
            get: () => null as never,
          },
          module: false,
          keep_classnames: true,
          keep_fnames: true,
          properties: {
            regex: /mangle only annotated/,
          },
        },
      })

      this.logger.info("TERSER", "Mangling with Terser")
      if (!minifiedOutput.code) {
        this.logger.error("TERSER", "Failed to mangle with terser")
      }
      this.logger.success("TERSER", "Terser Mangling success")

      return { code: minifiedOutput.code!, map: minifiedOutput.map }
    } catch (error) {
      this.logger.error("TERSER", "Failed to mangle with terser")
      this.logger.error("TERSER", error)

      return { code, map: info.map }
    }
  },
}

export default defineConfig({
  entryPoints: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  plugins: [manglePlugin],
  terserOptions: {
    compress: true,
  },
})