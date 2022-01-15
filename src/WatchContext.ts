import { warning } from "./utils"

export enum WatcherPermission {
  AllowAll = 0,
  AllowSubscribeOnly = 1,
  RestrictAll = 2,
}

export interface WatchStore {
  key: string
  subscribe(listener: VoidFunction): VoidFunction
}

export class WatchContext {
  private static current: null | WatchContext = null
  private static watcherPermission = WatcherPermission.AllowAll

  public static warning(
    message: string,
    requiredPermission: WatcherPermission = WatcherPermission.AllowAll,
  ): boolean {
    if (WatchContext.watcherPermission <= requiredPermission) {
      return false
    }

    warning(message)

    return true
  }

  public static executeWatcher<T>(watcher: () => T): T {
    WatchContext.watcherPermission = WatcherPermission.RestrictAll
    const value = watcher()
    WatchContext.watcherPermission = WatcherPermission.AllowAll

    return value
  }

  public static register(store: WatchStore): void {
    WatchContext.current?.register(store)
  }

  private readonly deadCleanups = new Set<string>()
  private readonly cleanups = new Map<string, VoidFunction>()

  public constructor(private readonly listener: VoidFunction) {}

  private register(store: WatchStore): void {
    if (this.cleanups.has(store.key)) {
      // still alive
      this.deadCleanups.delete(store.key)
    } else {
      WatchContext.watcherPermission = WatcherPermission.AllowSubscribeOnly
      this.cleanups.set(store.key, store.subscribe(this.listener))
      WatchContext.watcherPermission = WatcherPermission.RestrictAll
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

  public activate<T>(watcher: () => T): void {
    WatchContext.current = this

    // fill up dead cleanups with all of the current cleanups
    // to keep only real dead once during .register() call
    this.cleanups.forEach((_, key) => this.deadCleanups.add(key))

    WatchContext.executeWatcher(watcher)

    this.cleanupObsolete()

    WatchContext.current = null
  }

  public cleanup(): void {
    this.cleanups.forEach((cleanup) => cleanup())
    this.cleanups.clear()
    this.deadCleanups.clear()
  }
}
