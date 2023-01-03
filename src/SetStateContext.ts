import type { Dispatch } from "react"

import { noop } from "./utils"
import type { WatchContext } from "./WatchContext"

/**
 * A context that allows to collect Impulse#setState subscribers and execute them all at once.
 * This is useful when multiple stores are updated at the same time.
 *
 * @private
 */
export class SetStateContext {
  private static current: null | SetStateContext = null

  public static registerWatchContext(ctx: WatchContext): void {
    SetStateContext.current?.registerWatchContext(ctx)
  }

  public static registerStoreSubscribers(): [
    emit: VoidFunction,
    register: Dispatch<Map<VoidFunction, number>>,
  ] {
    if (SetStateContext.current != null) {
      const { current } = SetStateContext

      // the context already exists - it should not emit anything at this point
      return [
        noop,
        (subs) => {
          current.batchStoreSubscribers(subs)
        },
      ]
    }

    // the first setState call should create the context and emit the listeners
    const current = new SetStateContext()

    SetStateContext.current = current

    return [
      () => {
        current.emit()
        SetStateContext.current = null
      },
      (subs) => {
        current.batchStoreSubscribers(subs)
      },
    ]
  }

  private readonly storeSubscribers: Array<Map<VoidFunction, number>> = []
  private readonly watchContexts = new Set<WatchContext>()

  private constructor() {
    // make private
  }

  private batchStoreSubscribers(subs: Map<VoidFunction, number>): void {
    this.storeSubscribers.push(subs)
  }

  private registerWatchContext(ctx: WatchContext): void {
    this.watchContexts.add(ctx)
  }

  private emit(): void {
    const calledListeners = new WeakSet<VoidFunction>()

    this.storeSubscribers.forEach((subs) => {
      subs.forEach((_, listener) => {
        // don't emit the same listener twice, for instance when using `useWatchImpulse`
        if (!calledListeners.has(listener)) {
          // the listener might register watchers (for useWatchImpulse)
          // so each watcher will emit only once in the code bellow
          // even if there were multiple watching stores updated
          listener()
          calledListeners.add(listener)
        }
      })
    })

    this.watchContexts.forEach((ctx) => ctx.emit())
    this.watchContexts.clear()
  }
}
