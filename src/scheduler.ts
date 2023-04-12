import type { Dispatch } from "react"

export interface Emitter {
  emit(): void
}

let queue: null | Array<ReadonlySet<Emitter>> = null

const enqueue = (emitters: ReadonlySet<Emitter>): void => {
  queue!.push(emitters)
}

// TODO move to batch.ts
export const scheduleEmit = (execute: Dispatch<typeof enqueue>): void => {
  if (queue == null) {
    queue = []

    execute(enqueue)

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
    execute(enqueue)
  }
}
