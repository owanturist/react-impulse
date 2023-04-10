import { useCallback, useLayoutEffect, useRef } from "react"

export const useEvent = <TArgs extends Array<unknown>, TResult>(
  handler: (...args: TArgs) => TResult,
): ((...args: TArgs) => TResult) => {
  const handlerRef = useRef<(...args: TArgs) => TResult>()

  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  return useCallback((...args: TArgs) => handlerRef.current!(...args), [])
}
