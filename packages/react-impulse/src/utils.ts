import type { Scope } from "./Scope"
import { type EffectCallback, useRef } from "./dependencies"

/**
 * A function that compares two values and returns `true` if they are equal.
 * Depending on the type of the values it might be reasonable to use
 * a custom compare function such as shallow-equal or deep-equal.
 *
 * @version 1.0.0
 */
export type Compare<T> = (left: T, right: T, scope: Scope) => boolean

export type Destructor = ReturnType<EffectCallback>

export type Func<TArgs extends ReadonlyArray<unknown>, TResult = void> = (
  ...args: TArgs
) => TResult

export const eq = <T>(left: T, right: T): boolean => Object.is(left, right)

export function noop(): void {
  // do nothing
}

export function identity<T>(value: T): T {
  return value
}

export function isFunction<
  TFunction extends Func<ReadonlyArray<never>, unknown>,
>(anything: unknown): anything is TFunction {
  return typeof anything === "function"
}

export function useHandler<TArgs extends ReadonlyArray<unknown>, TResult>(
  handler: Func<TArgs, TResult>,
): Func<TArgs, TResult> {
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

export function usePermanent<TValue>(init: () => TValue): TValue {
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
  const ref = useRef<{ _value: TValue }>()

  ref.current ??= { _value: init() }

  return ref.current._value
}
