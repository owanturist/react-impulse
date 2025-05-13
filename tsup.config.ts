import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["./src/index.ts"],
  outDir: "./dist",
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  terserOptions: {
    mangle: {
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
  },
  // any package is external
  external: [/^\w+/],
})
