import { warning } from "./utils"

export interface Subscriber {
  key: string
  subscribe(listener: VoidFunction): VoidFunction
}

export class WatchContext {
  private static current: null | WatchContext = null
  private static isReadonlyDuringWatcherCall = false

  public static warning(message: string): boolean {
    if (WatchContext.isReadonlyDuringWatcherCall) {
      warning(message)
    }

    return WatchContext.isReadonlyDuringWatcherCall
  }

  public static executeWatcher<T>(watcher: () => T): T {
    WatchContext.isReadonlyDuringWatcherCall = true
    const value = watcher()
    WatchContext.isReadonlyDuringWatcherCall = false

    return value
  }

  public static register(store: Subscriber): void {
    WatchContext.current?.register(store)
  }

  private readonly listener: VoidFunction
  private readonly deadCleanups = new Set<string>()
  private readonly cleanups = new Map<string, VoidFunction>()

  public constructor(listener: VoidFunction) {
    this.listener = () => this.cycle(listener)
  }

  private register(store: Subscriber): void {
    if (this.cleanups.has(store.key)) {
      // still alive
      this.deadCleanups.delete(store.key)
    } else {
      WatchContext.isReadonlyDuringWatcherCall = false
      this.cleanups.set(store.key, store.subscribe(this.listener))
      WatchContext.isReadonlyDuringWatcherCall = true
    }
  }

  private cleanupObsolete(): void {
    this.deadCleanups.forEach((key) => {
      const clean = this.cleanups.get(key)

      if (clean != null) {
        clean()
        this.cleanups.delete(key)
      }
    })

    this.deadCleanups.clear()
  }

  private cycle(callback: VoidFunction): void {
    WatchContext.current = this

    // fill up dead cleanups with all of the current cleanups
    // to keep only real dead once during .register() call
    this.cleanups.forEach((_, key) => this.deadCleanups.add(key))

    callback()

    this.cleanupObsolete()

    WatchContext.current = null
  }

  public activate<T>(watcher: () => T): void {
    this.cycle(() => WatchContext.executeWatcher(watcher))
  }

  public cleanup(): void {
    this.cleanups.forEach((cleanup) => cleanup())
    this.cleanups.clear()
    this.deadCleanups.clear()
  }
}
