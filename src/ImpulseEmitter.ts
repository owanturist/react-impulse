const enqueue = <T>(queue: Array<T>, emitter: null | T): void => {
  if (emitter != null) {
    queue.push(emitter)
  }
}

const dequeue = <T extends object>(
  queue: Array<ReadonlySet<T>>,
  cb: (item: T) => void,
): void => {
  const uniq = new WeakSet<T>()

  queue.forEach((bag) => {
    bag.forEach((emitter) => {
      if (!uniq.has(emitter)) {
        uniq.add(emitter)
        cb(emitter)
      }
    })
  })
}

/**
 * A context to track Impulse#getValue usage inside the watcher function.
 * The tracked calls will subscribe related stores to updates,
 * so the watcher will execute on each update.
 *
 * @private
 */
export class ImpulseEmitter {
  private static queue: null | Array<ReadonlySet<ImpulseEmitter>> = null

  public static schedule(
    execute: () => null | ReadonlySet<ImpulseEmitter>,
  ): void {
    if (ImpulseEmitter.queue == null) {
      ImpulseEmitter.queue = []

      enqueue(ImpulseEmitter.queue, execute())
      dequeue(ImpulseEmitter.queue, (emitter) => emitter.emit())

      ImpulseEmitter.queue = null
    } else {
      enqueue(ImpulseEmitter.queue, execute())
    }
  }

  private readonly cleanups: Array<VoidFunction> = []

  private version = 0

  private tick: null | VoidFunction = null

  private increment(): void {
    this.version = (this.version + 1) % 10e9
    this.detach()
  }

  public emit(): void {
    this.increment()
    this.tick?.()
  }

  public detach(): void {
    this.cleanups.forEach((cleanup) => cleanup())
    this.cleanups.length = 0
  }

  public attach(cleanup: VoidFunction): void {
    this.cleanups.push(cleanup)
  }

  public onEmit = (tick: VoidFunction): VoidFunction => {
    // in case if subscribe is called twice
    if (this.tick != null) {
      this.increment()
    }

    this.tick = tick

    return () => {
      this.increment()
      this.tick = null
    }
  }

  public getVersion = (): number => {
    return this.version
  }
}
