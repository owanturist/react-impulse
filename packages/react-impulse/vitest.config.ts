import React from "react"
import type { ProjectConfig } from "vitest"
import { defineProject } from "vitest/config"

// eslint-disable-next-line no-console
console.log(`Running react-impulse tests against react@${React.version}`)

export default defineProject({
  test: {
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    environment: "happy-dom",
    setupFiles: "./setup-tests.ts",
  } satisfies ProjectConfig,
})
