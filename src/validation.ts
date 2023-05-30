import type { Impulse } from "./Impulse"
import { isFunction } from "./utils"

// TODO come up with better type name
export type NAMES = "subscribe" | "scoped" | "useScoped" | "useScopedMemo"

// TODO come up with better name
let currentName: null | NAMES = null

// TODO come up with better type name
export function warnContext<TArgs extends ReadonlyArray<unknown>, TResult>(
  name: NAMES,
  func: (...args: TArgs) => TResult,
  ...args: TArgs
): TResult {
  const prev = currentName

  currentName = name

  const result = func(...args)

  currentName = prev

  return result
}

// TODO delete

const BAR: Record<
  NAMES,
  Partial<Record<keyof Impulse<unknown> | keyof typeof Impulse, string>>
> = {
  subscribe: {
    of: "You should not call Impulse.of inside of the subscribe listener. The listener is for read-only operations but Impulse.of creates a new Impulse.",
    clone:
      "You should not call Impulse#clone inside of the subscribe listener. The listener is for read-only operations but Impulse#clone clones an existing Impulse.",
  },
  scoped: {
    setValue:
      "You should not call Impulse#setValue during rendering of scoped(Component)",
  },
  useScoped: {
    of: "You should not call Impulse.of inside of the useScoped factory. The useScoped hook is for read-only operations but Impulse.of creates a new Impulse.",
    clone:
      "You should not call Impulse#clone inside of the useScoped factory. The useScoped hook is for read-only operations but Impulse#clone clones an existing Impulse.",
    setValue:
      "You should not call Impulse#setValue inside of the useScoped factory. The useScoped hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
  },
  useScopedMemo: {
    of: "You should not call Impulse.of inside of the useScopedMemo factory. The useScopedMemo hook is for read-only operations but Impulse.of creates a new Impulse.",
    clone:
      "You should not call Impulse#clone inside of the useScopedMemo factory. The useScopedMemo hook is for read-only operations but Impulse#clone clones an existing Impulse.",
    setValue:
      "You should not call Impulse#setValue inside of the useScopedMemo factory. The useScopedMemo hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
  },
}

// TODO come up with better name
export function getMessageFor(
  name_2: keyof typeof Impulse | keyof Impulse<unknown>,
  name: null | NAMES,
): null | undefined | string {
  if (name == null) {
    return null
  }

  // TODO come up with better name
  return BAR[name][name_2]
}

// TODO come up with better name
export function warnwarn(context: NAMES, message: string) {
  return (
    _: unknown,
    __: string,
    descriptor: TypedPropertyDescriptor<(...args: ReadonlyArray<any>) => any>,
  ): void => {
    if (
      process.env.NODE_ENV === "production" ||
      typeof console === "undefined" ||
      // eslint-disable-next-line no-console
      !isFunction(console.error)
    ) {
      return
    }

    const original = descriptor.value

    descriptor.value = function (...args) {
      if (context === currentName) {
        // eslint-disable-next-line no-console
        console.error(message)
      }

      return original.apply(this, args)
    }
  }
}

// TODO come up with better name
// preventSideEffect maybe
export function stopstop(context: NAMES, message: string) {
  return (
    _: unknown,
    __: string,
    descriptor: TypedPropertyDescriptor<(...args: ReadonlyArray<any>) => void>,
  ): void => {
    const original = descriptor.value

    descriptor.value = function (...args) {
      if (context !== currentName) {
        original.apply(this, args)
      } else if (
        process.env.NODE_ENV !== "production" &&
        typeof console !== "undefined" &&
        // eslint-disable-next-line no-console
        isFunction(console.error)
      ) {
        // eslint-disable-next-line no-console
        console.error(message)
      }
    }
  }
}
