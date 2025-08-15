export interface ImpulseFormOptionalConciseSchema<TEnabled, TElement> {
  readonly enabled: TEnabled
  readonly element: TElement | { enabled: true; value: TElement }
}
