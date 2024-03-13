/* eslint-disable no-restricted-imports */

export { type RefObject, useEffect, useLayoutEffect, useRef } from "react"
export {
  type Scope,
  type Compare,
  type ReadonlyImpulse,
  Impulse,
  batch,
  untrack,
} from "react-impulse"
// remeda is built-in to the bundle
// eslint-disable-next-line import/no-extraneous-dependencies
export {
  isDefined,
  isFunction,
  isBoolean,
  isString,
  isTruthy,
  isArray,
  identity,
} from "remeda"
