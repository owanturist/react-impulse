import path from "path"
// eslint-disable-next-line
import nodeResolve from "@rollup/plugin-node-resolve"
import typescript from "rollup-plugin-typescript2"
import replace from "rollup-plugin-replace"
import commonjs from "rollup-plugin-commonjs"
import { terser } from "rollup-plugin-terser"

const terserOptions = {
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
  },
}

const UMD_EXTERNALS = ["react"]

const UMD_GLOBALS = {
  react: "React",
  crypto: "crypto",
}

const UMD_NAME = "ReactInnerStore"

const extensions = [".ts"]

const isExternal = (filePath) => {
  return !filePath.startsWith(".") && !path.isAbsolute(filePath)
}

const root = __dirname

const input = path.resolve(root, "./src/index.ts")
const tsconfig = path.resolve(root, "./tsconfig.prod.json")

export default [
  // CommonJS
  {
    input,
    external: isExternal,
    output: {
      file: path.resolve(root, "dist/index.cjs"),
      format: "cjs",
      indent: false,
      sourcemap: true,
      exports: "auto",
    },
    plugins: [
      nodeResolve({ extensions }),
      commonjs(),
      typescript({
        tsconfig,
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
          },
        },
      }),
    ],
  },

  // ES
  {
    input,
    external: isExternal,
    output: {
      file: path.resolve(root, "dist/index.mjs"),
      format: "es",
      indent: false,
      sourcemap: true,
    },
    plugins: [
      nodeResolve({ extensions }),
      commonjs(),
      typescript({ tsconfig }),
    ],
  },

  // ES for Browsers
  {
    input,
    external: isExternal,
    output: {
      file: path.resolve(root, "dist/index.js"),
      format: "es",
      indent: false,
      sourcemap: true,
    },
    plugins: [
      nodeResolve({ extensions }),
      commonjs(),
      typescript({ tsconfig }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      terser({ module: true, ...terserOptions }),
    ],
  },

  // UMD Development
  {
    input,
    external: UMD_EXTERNALS,
    output: {
      file: path.resolve(root, "dist/index-dev.umd.js"),
      format: "umd",
      indent: false,
      name: UMD_NAME,
      globals: UMD_GLOBALS,
    },
    plugins: [
      nodeResolve({ extensions }),
      commonjs(),
      typescript({ tsconfig }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("development"),
      }),
    ],
  },

  // UMD Production
  {
    input,
    external: UMD_EXTERNALS,
    output: {
      file: path.resolve(root, "dist/index-prod.umd.js"),
      format: "umd",
      indent: false,
      name: UMD_NAME,
      globals: UMD_GLOBALS,
    },
    plugins: [
      nodeResolve({ extensions }),
      commonjs(),
      typescript({ tsconfig }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      terser(terserOptions),
    ],
  },
]
