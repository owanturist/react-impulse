import tsconfigPaths from "vite-tsconfig-paths"
import { defineProject } from "vitest/config"
import type { ProjectConfig } from "vitest/node"

export default defineProject({
  plugins: [tsconfigPaths()],

  test: {
    globals: true,
    isolate: false,
    setupFiles: "./setup-tests.ts",
  } satisfies ProjectConfig,
})
