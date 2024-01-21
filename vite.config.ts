import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        autoUpdate: true,
        "packages/react-impulse/src/**.ts": {
          lines: 100,
          statements: 100,
          branches: 100,
          functions: 100,
        },
      },
      include: ["**/src/**"],
      reporter: ["text", "json"],
    },
  },
})
