export class WeakLink<T extends WeakKey> {
  private readonly _refs = new Set<WeakRef<T>>()

  public _link(ref: WeakRef<T>): void | VoidFunction {
    if (!this._refs.has(ref)) {
      this._refs.add(ref)

      return () => {
        this._refs.delete(ref)
      }
    }
  }

  public [Symbol.iterator](): Iterator<T> {
    const iterator = this._refs.values()

    return {
      next: () => {
        let ref = iterator.next()

        while (!ref.done) {
          const value = ref.value.deref()

          if (value) {
            return { value }
          }

          ref = iterator.next()
        }

        return { done: true, value: undefined }
      },
    }
  }
}
