function isDefined<TValue>(data: null | undefined | TValue): data is TValue {
  return data != null
}

export { isDefined }
