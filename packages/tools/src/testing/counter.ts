afterEach(() => {
  Counter.equals.mockClear()
})

abstract class Counter {
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

export { Counter }
