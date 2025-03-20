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
      },
    },
  },
  // any package is external
  external: [/^\w+/],
})
