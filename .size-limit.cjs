module.exports = [
  {
    name: "react-impulse.js",
    path: "packages/react-impulse/dist/index.js",
  },
  {
    name: "react-impulse.cjs",
    path: "packages/react-impulse/dist/index.cjs",
  },
  {
    name: "react-impulse-form.js",
    path: "packages/react-impulse-form/dist/index.js",
  },
  {
    name: "react-impulse-form.cjs",
    path: "packages/react-impulse-form/dist/index.cjs",
  },
].map((config) => ({
  ...config,
  gzip: true,
  ignore: ["*"],
}))
