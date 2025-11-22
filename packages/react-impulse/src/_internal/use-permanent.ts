import { useRef } from "../_dependencies"

function usePermanent<TValue>(init: () => TValue): TValue {
  /**
   * According to the official React documentation
   * it is ok to write to the ref object during initialization.
   *
   * > Normally, writing or reading ref.current during render is not allowed.
   * > However, it’s fine in this case because the result is always the same,
   * > and the condition only executes during initialization so it’s fully predictable.
   *
   * @link https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents
   */
  const ref = useRef<null | { _value: TValue }>(null)

  ref.current ??= { _value: init() }

  return ref.current._value
}

export { usePermanent }
