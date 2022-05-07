import { useRef, useLayoutEffect } from "react"

export const useEvent = <THandler extends (...args: Array<never>) => unknown>(
  handler: THandler,
): THandler => {
  const handlerRef = useRef(handler)

  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  return useRef(((...args) => handlerRef.current(...args)) as THandler).current
}
