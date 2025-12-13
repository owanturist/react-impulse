import { defineConfig } from "tsup"

export default defineConfig({
  outDir: "./dist",
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  terserOptions: {
    mangle: {
      module: false,
      keep_classnames: false,
      keep_fnames: false,
      properties: {
        regex: /^_[^_]\w+[^_]$/,
        // @ts-expect-error undocumented, but it specifies how to mangle properties
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
