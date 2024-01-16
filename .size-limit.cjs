module.exports = [
  "packages/react-impulse/dist/index.js",
  "packages/react-impulse/dist/index.cjs",
].map((path) => ({
  path,
  gzip: true,
  ignore: ["use-sync-external-store"],
}))
