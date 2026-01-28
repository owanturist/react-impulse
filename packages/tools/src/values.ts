const { values } = Object as {
  values: <TObject>(object: TObject) => ReadonlyArray<TObject[keyof TObject]>
}

export { values }
