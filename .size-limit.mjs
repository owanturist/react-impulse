export default [
  {
    name: "signal",
  },
  {
    name: "signal-form",
    ignore: ["@owanturist/signal"],
  },
  {
    name: "signal-react",
    ignore: ["@owanturist/signal", "react", "use-sync-external-store"],
  },
]
  .flatMap((config) => [".js", ".cjs"].map((ext) => ({ ...config, ext })))
  .map(({ name, ignore, ext }) => ({
    name: `${name}/*${ext}`,
    path: `packages/${name}/dist/*${ext}`,
    gzip: true,
    ignore,
  }))
