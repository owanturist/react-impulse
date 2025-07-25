import { mapValues } from "~/tools/map-values"
import { partitionEntries } from "~/tools/partition-entries"

import { Impulse, type Scope } from "../dependencies"
import { ImpulseForm, isImpulseForm } from "../impulse-form"

import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import { ImpulseFormShapeState } from "./_impulse-form-shape-state"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeInput } from "./impulse-form-shape-input"

export class ImpulseFormShape<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseForm<ImpulseFormShapeParams<TFields>> {
  public readonly fields: Readonly<TFields>

  public readonly _state: ImpulseFormShapeState<TFields>

  public constructor(
    parent: null | ImpulseForm,
    initial: Impulse<ImpulseFormShapeInput<TFields>>,
    fields: TFields,
  ) {
    super(parent)

    this.fields = mapValues(fields, (field: unknown | ImpulseForm, key) => {
      if (!isImpulseForm(field)) {
        return field
      }

      const derivedInitial = Impulse(
        (scope) => {
          return initial.getValue(scope)[key]
        },
        (next, scope) => {
          initial.setValue((current) => {
            if (field._state._isInputEqual(current[key], next, scope)) {
              return current
            }

            return {
              ...current,
              [key]: next,
            }
          })
        },

        {
          compare: field._state._isInputEqual,
        },
      )

      return this._parentOf(field, derivedInitial)
    })

    const [impulseFields, constants] = partitionEntries(
      this.fields,
      isImpulseForm,
    )

    this._state = new ImpulseFormShapeState(
      initial,
      mapValues(impulseFields, ({ _state }) => _state),
      constants,
    )
  }

  protected _childOf(
    parent: ImpulseForm,
    initial: Impulse<ImpulseFormShapeInput<TFields>>,
  ): ImpulseFormShape<TFields> {
    return new ImpulseFormShape(parent, initial, this.fields)
  }
}
