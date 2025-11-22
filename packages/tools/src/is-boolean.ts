function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean"
}

export { isBoolean }
