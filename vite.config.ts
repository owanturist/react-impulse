import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    coverage: {
      exclude: ["**/*.?(c)js", "**/*.d.ts", "**/setup-tests.ts"],
      reporter: ["text", "json"],
    },
  },
})
