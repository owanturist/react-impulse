"use strict"

module.exports = [
  {
    name: "signal",
    ignore: ["use-sync-external-store"],
  },
  {
    name: "signal-form",
    ignore: ["@owanturist/signal"],
  },
]
  .flatMap((config) => [".js", ".cjs"].map((ext) => ({ ...config, ext })))
  .map(({ name, ignore, ext }) => ({
    name: `${name}${ext}`,
    path: `packages/${name}/dist/index${ext}`,
    gzip: true,
    ignore: ["react", ...ignore],
  }))
