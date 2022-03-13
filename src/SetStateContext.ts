import { Dispatch } from "react"

import { noop } from "./utils"

/**
 * A context that allows to collect Sweety#setState subscribers and execute them all at once.
 * This is useful when multiple stores are updated at the same time.
 *
 * @private
 */
export abstract class SetStateContext {
  private static subscribers: null | Array<Map<string, VoidFunction>> = null

  public static init(): [VoidFunction, Dispatch<Map<string, VoidFunction>>] {
    if (SetStateContext.subscribers != null) {
      const { subscribers } = SetStateContext

      // the context already exists - it should not emit anything at this point
      return [
        noop,
        (subs) => {
          subscribers.push(subs)
        },
      ]
    }

    // the first setState call should create the context and emit the listeners
    SetStateContext.subscribers = []

    const { subscribers } = SetStateContext

    return [
      () => {
        const calledListeners = new WeakSet<VoidFunction>()

        subscribers.forEach((subs) => {
          subs.forEach((listener) => {
            // don't emit the same listener twice, for instance when using `useWatchSweety`
            if (!calledListeners.has(listener)) {
              listener()
              calledListeners.add(listener)
            }
          })
        })

        SetStateContext.subscribers = null
      },
      (subs) => {
        subscribers.push(subs)
      },
    ]
  }
}

export const batch = (execute: VoidFunction): void => {
  const [emit] = SetStateContext.init()

  execute()

  emit()
}
