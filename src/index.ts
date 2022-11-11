import { useEffect, useLayoutEffect } from "react"

import { createEffectHook } from "./createEffectHook"

export type { Dispatch } from "react"
export type { Compare, SetSweetyState } from "./utils"
export type { ExtractSweetyState, DeepExtractSweetyState } from "./Sweety"
export { Sweety } from "./Sweety"
export { batch } from "./SetStateContext"
export { watch } from "./watch"
export { useSweetyMemo } from "./useSweetyMemo"
export { useSweety } from "./useSweety"
export { useGetSweetyState } from "./useGetSweetyState"
export { useSetSweetyState } from "./useSetSweetyState"
export { useSweetyState } from "./useSweetyState"
export { useSweetyReducer } from "./useSweetyReducer"
export { useWatchSweety } from "./useWatchSweety"

export const useSweetyEffect = createEffectHook(useEffect)
export const useSweetyLayoutEffect = createEffectHook(useLayoutEffect)
