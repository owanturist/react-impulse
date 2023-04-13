export interface Emitter {
  emit(): void
}

let queue: null | Array<ReadonlySet<Emitter>> = null

const enqueue = <T>(arr: Array<T>, item: undefined | T): void => {
  if (item != null) {
    arr.push(item)
  }
}

// TODO move to batch.ts
export const scheduleEmit = (
  execute: VoidFunction | (() => ReadonlySet<Emitter>),
): void => {
  if (queue == null) {
    queue = []

    enqueue(queue, execute())

    const completed = new WeakSet<Emitter>()

    queue.forEach((bag) => {
      bag.forEach((emitter) => {
        if (!completed.has(emitter)) {
          completed.add(emitter)
          emitter.emit()
        }
      })
    })

    queue = null
  } else {
    enqueue(queue, execute())
  }
}
