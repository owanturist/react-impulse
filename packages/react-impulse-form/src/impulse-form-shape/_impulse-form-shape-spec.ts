import { isNull } from "~/tools/is-null"
import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"
import { mapValues } from "~/tools/map-values"
import type { OmitValues } from "~/tools/omit-values"
import { Option, Some } from "~/tools/option"
import { resolveSetter } from "~/tools/setter"

import { createNullableCompare } from "../create-nullable-compare"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type {
  ImpulseFormSpec,
  ImpulseFormSpecPatch,
} from "../impulse-form/impulse-form-spec"

import { ImpulseFormShape } from "./_impulse-form-shape"
import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import {
  ImpulseFormShapeState,
  type ImpulseFormShapeStateFields,
} from "./_impulse-form-shape-state"
import type { ImpulseFormShapeErrorVerbose } from "./impulse-form-shape-error-verbose"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeInput } from "./impulse-form-shape-input"

export type ImpulseFormShapeSpecFields<TFields extends ImpulseFormShapeFields> =
  OmitValues<
    {
      [TField in keyof TFields]: TFields[TField] extends ImpulseForm<
        infer TParams
      >
        ? ImpulseFormSpec<TParams>
        : never
    },
    never
  >

export class ImpulseFormShapeSpec<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> implements ImpulseFormSpec<ImpulseFormShapeParams<TFields>>
{
  public readonly _initial = {
    ...mapValues(this._fields, ({ _initial }) => _initial),
    ...this._constants,
  } as ImpulseFormShapeInput<TFields>

  public readonly _input = {
    ...mapValues(this._fields, ({ _input }) => _input),
    ...this._constants,
  } as ImpulseFormShapeInput<TFields>

  public readonly _error = {
    ...mapValues(this._fields, ({ _error }) => _error),
    ...this._constants,
  } as ImpulseFormShapeErrorVerbose<TFields>

  public readonly _isOutputEqual = createNullableCompare(isShallowObjectEqual)

  public constructor(
    public readonly _fields: ImpulseFormShapeSpecFields<TFields>,
    public readonly _constants: Omit<
      TFields,
      keyof ImpulseFormShapeSpecFields<TFields>
    >,
  ) {}

  public _override({
    _input,
    _initial,
    _error,
  }: ImpulseFormSpecPatch<
    ImpulseFormShapeParams<TFields>
  >): ImpulseFormShapeSpec<TFields> {
    const input = _input._map((setter) => {
      return resolveSetter(setter, this._input, this._initial)
    })

    const initial = _initial._map((setter) => {
      return resolveSetter(setter, this._initial, this._input)
    })

    const error = _error._map((setter) => {
      return resolveSetter(setter, this._error)
    })

    const fields = mapValues(this._fields, (field, key) => {
      return field._override({
        _input: input._chain((shape) => {
          return Option(shape[key as keyof typeof shape])
        }),

        _initial: initial._chain((shape) => {
          return Option(shape[key as keyof typeof shape])
        }),

        _error: error._chain((shape) => {
          if (isNull(shape)) {
            return Some(null)
          }

          return Option(shape[key as keyof typeof shape])
        }),
      })
    })

    return new ImpulseFormShapeSpec(
      fields as typeof this._fields,
      this._constants,
    )
  }

  public _create(): ImpulseFormShape<TFields> {
    const fields = mapValues(this._fields, (field) => field._create())
    const state = new ImpulseFormShapeState(
      this,
      mapValues(fields, (field) => field._state),
      this._constants,
    )

    return new ImpulseFormShape(this, state, fields)
  }
}
