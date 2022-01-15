import { Dispatch } from "react"

import { noop } from "./utils"

/**
 * A context that allows to collect setState subscribers and execute them all at once.
 * This is useful when multiple stores are updated at the same time.
 *
 * @private
 */
export abstract class SetStateContext {
  private static subscribers: null | Array<Map<string, VoidFunction>> = null

  public static init(): [Dispatch<Map<string, VoidFunction>>, VoidFunction] {
    if (SetStateContext.subscribers != null) {
      const { subscribers } = SetStateContext

      // the context already exists - it should not emit anything at this point
      return [
        (subs) => {
          subscribers.push(subs)
        },
        noop,
      ]
    }

    // the first setState call should create the context and emit the listeners
    SetStateContext.subscribers = []

    const { subscribers } = SetStateContext

    return [
      (subs) => {
        subscribers.push(subs)
      },
      () => {
        const calledListeners = new WeakSet<VoidFunction>()

        for (const subs of subscribers) {
          subs.forEach((listener) => {
            // don't emit the same listener twice, for instance when using `useInnerWatch`
            if (!calledListeners.has(listener)) {
              listener()
              calledListeners.add(listener)
            }
          })
        }

        SetStateContext.subscribers = null
      },
    ]
  }
}
