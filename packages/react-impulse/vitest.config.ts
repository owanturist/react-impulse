import { defineProject } from "vitest/config"
import React from "react"
import type { ProjectConfig } from "vitest"

// eslint-disable-next-line no-console
console.log(`Running react-impulse tests against React@${React.version}`)

export default defineProject({
  test: {
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    environment: "happy-dom",
    setupFiles: ["./setup-tests.ts", "../../setup-tests.ts"],
  } satisfies ProjectConfig,
})
