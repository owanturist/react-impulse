export type IsEqualType<TLeft, TRight> = [TLeft, TRight] extends [TRight, TLeft]
  ? true
  : false
