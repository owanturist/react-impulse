export {
  type WithImpulse,
  type WithCompare,
  type WithFirst,
  type WithSecond,
  type WithThird,
  type WithSpy,
  type WithListener,
  type WithIsActive,
  Counter,
}

import type { Compare, Impulse } from "../src"

afterEach(() => {
  Counter.compare.mockClear()
})

abstract class Counter {
  public abstract readonly count: number

  public static compare = vi.fn((prev, next) => {
    return prev.count === next.count
  }) satisfies Compare<Counter>

  public static merge(left: Counter, right: Counter, ...rest: Array<Counter>) {
    return {
      count: [left, right, ...rest]
        .map(Counter.getCount)
        .reduce((acc, x) => acc + x, 0),
    }
  }

  public static clone(counter: Counter): Counter {
    return { ...counter }
  }

  public static getCount(counter: Counter): number {
    return counter.count
  }

  public static inc({ count }: Counter): Counter {
    return { count: count + 1 }
  }
}

interface WithImpulse<T = Counter> {
  impulse: Impulse<T>
}

interface WithCompare<T = Counter> {
  compare?: null | Compare<T>
}

interface WithFirst<T = Counter> {
  first: Impulse<T>
}

interface WithSecond<T = Counter> {
  second: Impulse<T>
}

interface WithThird<T = Counter> {
  third: Impulse<T>
}

interface WithSpy {
  spy(...args: Array<unknown>): void
}

interface WithListener {
  listener: VoidFunction
}

interface WithIsActive {
  isActive: boolean
}
