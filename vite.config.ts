import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    coverage: {
      include: ["packages/react-impulse/src/**"],
      reporter: ["text", "json"],
    },
  },
})
