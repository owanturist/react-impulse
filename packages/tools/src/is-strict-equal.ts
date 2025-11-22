function isStrictEqual<T>(left: T, right: T): boolean {
  return Object.is(left, right)
}

export { isStrictEqual }
