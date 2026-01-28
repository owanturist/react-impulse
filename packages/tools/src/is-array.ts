const { isArray } = Array as {
  isArray: <T>(data: ArrayLike<unknown> | T) => data is ReadonlyArray<unknown>
}

export { isArray }
