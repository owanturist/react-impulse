import type { ImpulseForm } from "./impulse-form"
import type { ImpulseFormParams } from "./impulse-form-params"

export interface ImpulseFormSnapshot<
  TParams extends ImpulseFormParams = ImpulseFormParams,
> {
  _restore(root: null | ImpulseForm): ImpulseForm<TParams>
  _merge(override: this): this
}
