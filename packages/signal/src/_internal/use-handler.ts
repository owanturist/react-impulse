import { useRef } from "react"

function useHandler<TArgs extends ReadonlyArray<unknown>, TResult>(
  handler: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult {
  /**
   * Despise React official documentation pointing out:
   *
   * > Do not write or read ref.current during rendering, except for initialization.
   * > This makes your component’s behavior unpredictable.
   *
   * While technically useLatest does write to ref.current during rendering (after the initial one), it's a widely accepted pattern because:
   * - It doesn't trigger re-renders.
   * - The side effect is predictable and serves a specific purpose (always having the latest value).
   * - It helps solve the common "stale closure" problem.
   * This pattern is recommended and used in many React resources despite the general warning in the useRef documentation.
   * The key is that the update to the ref doesn't directly influence the rendering output of the component in the same render cycle.
   *
   * @link https://react.dev/reference/react/useRef#caveats
   * @link https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents
   */

  const ref = useRef({
    _value: handler,
    _getter: (...args: TArgs) => ref.current._value(...args),
  })

  ref.current._value = handler

  return ref.current._getter
}

export { useHandler }
