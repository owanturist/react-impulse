import React from "react"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineProject } from "vitest/config"
import type { ProjectConfig } from "vitest/node"

console.log(`Running react-impulse-form tests against react@${React.version}`)

export default defineProject({
  plugins: [tsconfigPaths()],

  test: {
    globals: true,
    isolate: false,
    environment: "happy-dom",
    setupFiles: "./setup-tests.ts",
  } satisfies ProjectConfig,
})
