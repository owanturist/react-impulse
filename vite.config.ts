import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    workspace: ["packages/*"],

    coverage: {
      include: ["packages/react-impulse/src/**"],
      reporter: ["text", "json"],
    },
  },
})
