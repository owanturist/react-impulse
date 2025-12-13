import type { Equal, Signal } from "../src"

afterEach(() => {
  Counter.equals.mockClear()
})

export abstract class Counter {
  public abstract readonly count: number

  public static equals = vi.fn((prev: Counter, next: Counter) => prev.count === next.count)

  public static merge(left: Counter, right: Counter, ...rest: Array<Counter>): Counter {
    return {
      count: [left, right, ...rest].map(Counter.getCount).reduce((acc, x) => acc + x, 0),
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

export interface WithSignal<T = Counter> {
  signal: Signal<T>
}

export interface WithEquals<T = Counter> {
  equals?: null | Equal<T>
}

export interface WithFirst<T = Counter> {
  first: Signal<T>
}

export interface WithSecond<T = Counter> {
  second: Signal<T>
}

export interface WithThird<T = Counter> {
  third: Signal<T>
}

export interface WithSpy {
  spy(...args: Array<unknown>): void
}

export interface WithListener {
  listener: VoidFunction
}

export interface WithIsActive {
  isActive: boolean
}
