import { minify } from "terser"
import { type Options, defineConfig } from "tsup"

// Inspired by https://github.com/egoist/tsup/blob/692c112ac83f463d0be200253466c163c7cee36c/src/plugins/terser.ts
/**
 * The plugin mangles only properties starting from single '_' and not ending at '_' without minification and mangling anything else.
 * The annotation looks like
 */
const manglePlugin: Required<Options>["plugins"][0] = {
  name: "terser-mangle",
  renderChunk: async function (code, info) {
    if (!/\.(c|m)?js$/.test(info.path)) {
      return
    }

    try {
      const minifiedOutput = await minify(code, {
        compress: false,
        output: {
          beautify: true,
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
            regex: /^_[^_]\w+[^_]$/,
            // @ts-expect-error undocumented, but it specifies how to mangle Impulse's properties
            cache: {
              props: {
                $_value: "_",
                $_emitters: "$",
              },
            },
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

export default defineConfig(({ env = {} }) => {
  const packages = env.PACKAGE
    ? [env.PACKAGE]
    : ["react-impulse", "react-impulse-form"]

  return packages.map((name) => ({
    name,
    entry: [`packages/${name}/src/index.ts`],
    outDir: `packages/${name}/dist`,
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    plugins: [manglePlugin],
    // any package is external
    external: [/^\w+/],
  }))
})
