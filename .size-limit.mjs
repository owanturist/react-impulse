export default [
  {
    name: "signal",
    files: ["index", "monitor-factory"],
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
  .flatMap(({ files = ["index"], ...config }) => files.map((file) => ({ ...config, file })))
  .map(({ name, file, ignore, ext }) => ({
    name: `${name}/${file}${ext}`,
    path: `packages/${name}/dist/${file}${ext}`,
    gzip: true,
    ignore,
  }))
