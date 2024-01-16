module.exports = [
  {
    name: "react-impulse.js",
    path: "packages/react-impulse/dist/index.js",
  },
  {
    name: "react-impulse.cjs",
    path: "packages/react-impulse/dist/index.cjs",
  },
].map((config) => ({
  ...config,
  gzip: true,
  ignore: ["*"],
}))
