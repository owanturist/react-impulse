function isSet<T>(anything: unknown): anything is Set<T> {
  return anything instanceof Set
}

function hasProperty<TKey extends PropertyKey>(
  input: unknown,
  key: TKey,
): input is Record<TKey, unknown> {
  return typeof input === "object" && input != null && key in input
}

function getEmitters(input: unknown): null | Set<WeakRef<WeakKey>> {
  if (hasProperty(input, "_emitters") && isSet<WeakRef<WeakKey>>(input._emitters)) {
    return input._emitters
  }

  if (hasProperty(input, "$") && isSet<WeakRef<WeakKey>>(input.$)) {
    return input.$
  }

  return null
}

function toHaveEmittersSize(
  utils: {
    printReceived: (received: unknown) => string
    printExpected: (expected: unknown) => string
  },
  received: unknown,
  size: number,
) {
  const emitters = getEmitters(received)

  if (emitters == null) {
    return {
      pass: false,
      message: () => `expected ${utils.printReceived(received)} to be a Signal`,
    }
  }

  const activeEmitters = [...emitters].map((ref) => ref.deref()).filter((value) => value != null)

  return {
    pass: activeEmitters.length === size,
    message: () =>
      [
        "expected",
        utils.printReceived(activeEmitters.length),
        "to be",
        utils.printExpected(size),
      ].join(" "),
    actual: activeEmitters.length,
    expected: size,
  }
}

export { toHaveEmittersSize }
