export type Result<TError, TData> = [TError] extends [null]
  ? [null, TData]
  : [TError, null] | [null, TData]
