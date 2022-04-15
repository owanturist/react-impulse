interface Process {
  env: ProcessEnv
}

interface ProcessEnv {
  NODE_ENV: "development" | "test" | "production"
}

declare const process: Process
