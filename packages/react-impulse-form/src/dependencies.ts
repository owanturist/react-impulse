/* eslint-disable no-restricted-imports */

export {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react"
export {
  type Scope,
  type Compare,
  Impulse,
  tap,
  batch,
  untrack,
  useScoped,
} from "react-impulse"
// remeda is built-in to the bundle
// eslint-disable-next-line import/no-extraneous-dependencies
export { isFunction, isBoolean, isTruthy, identity } from "remeda"
