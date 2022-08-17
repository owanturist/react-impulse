// otherwise jest leaking into vitest type definitions
// https://github.com/testing-library/jest-dom/issues/427#issuecomment-1110985202
import "@testing-library/jest-dom/extend-expect"

// @ts-expect-error https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#configuring-your-testing-environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true
