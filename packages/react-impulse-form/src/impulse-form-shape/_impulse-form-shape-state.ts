import { isNull } from "~/tools/is-null"
import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"
import { isUndefined } from "~/tools/is-undefined"
import { mapValues } from "~/tools/map-values"
import type { OmitValues } from "~/tools/omit-values"
import { resolveSetter } from "~/tools/setter"
import { tapValues } from "~/tools/tap-values"
import { values } from "~/tools/values"

import { createNullableCompare } from "../create-nullable-compare"
import { Impulse } from "../dependencies"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import { ImpulseFormState } from "../impulse-form/impulse-form-state"

import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import type { ImpulseFormShapeErrorVerbose } from "./impulse-form-shape-error-verbose"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeInput } from "./impulse-form-shape-input"
import type { ImpulseFormShapeInputSetter } from "./impulse-form-shape-input-setter"
import type { ImpulseFormShapeOutput } from "./impulse-form-shape-output"
import type { ImpulseFormShapeOutputVerbose } from "./impulse-form-shape-output-verbose"

export type ImpulseFormShapeStateFields<
  TFields extends ImpulseFormShapeFields,
> = OmitValues<
  {
    [TField in keyof TFields]: TFields[TField] extends ImpulseForm<
      infer TParams
    >
      ? ImpulseFormState<TParams>
      : never
  },
  never
>

export class ImpulseFormShapeState<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseFormState<ImpulseFormShapeParams<TFields>> {
  public readonly _initial = Impulse(
    (scope) => {
      const initial = {
        ...mapValues(this._fields, ({ _initial }) => _initial.getValue(scope)),
        ...this._constants,
      }

      return initial as ImpulseFormShapeInput<TFields>
    },

    (next) => {
      tapValues(this._fields, ({ _initial }, key) => {
        _initial.setValue(next[key as keyof typeof next])
      })
    },

    {
      compare: isShallowObjectEqual,
    },
  )

  public readonly _input = Impulse(
    (scope) => {
      const input = {
        ...mapValues(this._fields, ({ _input }) => _input.getValue(scope)),
        ...this._constants,
      }

      return input as ImpulseFormShapeInput<TFields>
    },

    (next) => {
      tapValues(this._fields, ({ _input }, key) => {
        _input.setValue(next[key as keyof typeof next])
      })
    },

    {
      compare: isShallowObjectEqual,
    },
  )

  public readonly _error = Impulse(
    (scope) => {
      const error = mapValues(this._fields, ({ _error }) => {
        return _error.getValue(scope)
      })

      return error as ImpulseFormShapeErrorVerbose<TFields>
    },

    (next) => {
      tapValues(this._fields, ({ _error }, key) => {
        _error.setValue(next[key as keyof typeof next])
      })
    },

    {
      compare: isShallowObjectEqual,
    },
  )

  public readonly _output = Impulse(
    (scope) => {
      const output = mapValues(this._fields, ({ _output }) =>
        _output.getValue(scope),
      )

      for (const value of values(output)) {
        if (isNull(value)) {
          return null
        }
      }

      return {
        ...output,
        ...this._constants,
      } as ImpulseFormShapeOutput<TFields>
    },
    {
      compare: createNullableCompare(isShallowObjectEqual),
    },
  )

  public readonly _outputVerbose = Impulse(
    (scope) => {
      const output = {
        ...mapValues(this._fields, ({ _outputVerbose }) =>
          _outputVerbose.getValue(scope),
        ),
        ...this._constants,
      }

      return output as ImpulseFormShapeOutputVerbose<TFields>
    },
    {
      compare: isShallowObjectEqual,
    },
  )

  public constructor(
    private readonly _fields: ImpulseFormShapeStateFields<TFields>,
    private readonly _constants: Omit<
      TFields,
      keyof ImpulseFormShapeStateFields<TFields>
    >,
  ) {
    super()
  }

  public _resolveInputSetter(
    setter: ImpulseFormShapeInputSetter<TFields>,
    main: ImpulseFormShapeInput<TFields>,
    additional: ImpulseFormShapeInput<TFields>,
  ): ImpulseFormShapeInput<TFields> {
    const setters = resolveSetter(setter, main, additional)

    const inputs = mapValues(this._fields, (field, key) => {
      const fieldSetter = setters[key as keyof typeof setters]

      if (isUndefined(fieldSetter)) {
        return main[key]
      }

      return field._resolveInputSetter(
        fieldSetter,
        main[key as keyof typeof main],
        additional[key as keyof typeof additional],
      )
    })

    return inputs as ImpulseFormShapeInput<TFields>
  }
}
