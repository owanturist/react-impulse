import type { ImpulseFormUnit } from "../impulse-form-unit"
import type { ImpulseFormInitial } from "../impulse-form/impulse-form-initial"

import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeInitial<TFields extends ImpulseFormShapeFields> =
  GetImpulseFormShapeParam<TFields, "initial">

function x(
  k: ImpulseFormShapeInitial<{
    kek: ImpulseFormUnit<number>
    d: number
  }>,
) {
  k.kek
}
