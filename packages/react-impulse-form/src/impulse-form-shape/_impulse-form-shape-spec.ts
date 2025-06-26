import { isBoolean } from "~/tools/is-boolean"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { mapValues } from "~/tools/map-values"
import type { OmitValues } from "~/tools/omit-values"
import { Option, Some } from "~/tools/option"
import { resolveSetter } from "~/tools/setter"

import type { ImpulseForm } from "../impulse-form/impulse-form"
import type {
  ImpulseFormSpec,
  ImpulseFormSpecPatch,
} from "../impulse-form/impulse-form-spec"

import { ImpulseFormShape } from "./_impulse-form-shape"
import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import { ImpulseFormShapeState } from "./_impulse-form-shape-state"
import type { ImpulseFormShapeErrorVerbose } from "./impulse-form-shape-error-verbose"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeFlagVerbose } from "./impulse-form-shape-flag-verbose"
import type { ImpulseFormShapeInput } from "./impulse-form-shape-input"
import type { ImpulseFormShapeValidateOnVerbose } from "./impulse-form-shape-validate-on-verbose"

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
  public constructor(
    public readonly _fields: ImpulseFormShapeSpecFields<TFields>,
    public readonly _constants: Omit<
      TFields,
      keyof ImpulseFormShapeSpecFields<TFields>
    >,
  ) {}

  public readonly _initial = {
    ...mapValues(this._fields, ({ _initial }) => _initial),
    ...this._constants,
  } as ImpulseFormShapeInput<TFields>

  public readonly _input = {
    ...mapValues(this._fields, ({ _input }) => _input),
    ...this._constants,
  } as ImpulseFormShapeInput<TFields>

  public readonly _error = mapValues(
    this._fields,
    ({ _error }) => _error,
  ) as ImpulseFormShapeErrorVerbose<TFields>

  public readonly _validateOn = mapValues(
    this._fields,
    ({ _validateOn }) => _validateOn,
  ) as ImpulseFormShapeValidateOnVerbose<TFields>

  public readonly _touched = mapValues(
    this._fields,
    ({ _touched }) => _touched,
  ) as ImpulseFormShapeFlagVerbose<TFields>

  public _override({
    _input,
    _initial,
    _error,
    _validateOn,
    _touched,
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

    const validateOn = _validateOn._map((setter) => {
      return resolveSetter(setter, this._validateOn)
    })

    const touched = _touched._map((setter) => {
      return resolveSetter(setter, this._touched)
    })

    const fields = mapValues(this._fields, (field, key) => {
      return field._override({
        _input: input._chain((shape) => {
          return Option(shape[key])
        }),

        _initial: initial._chain((shape) => {
          return Option(shape[key])
        }),

        _error: error._chain((shape) => {
          if (isNull(shape)) {
            return Some(null)
          }

          return Option(shape[key])
        }),

        _validateOn: validateOn._chain((shape) => {
          if (isString(shape)) {
            return Some(shape)
          }

          return Option(shape[key])
        }),

        _touched: touched._chain((shape) => {
          if (isBoolean(shape)) {
            return Some(shape)
          }

          return Option(shape[key])
        }),
      })
    })

    return new ImpulseFormShapeSpec(fields, this._constants)
  }

  public _create(): ImpulseFormShape<TFields> {
    const fields = mapValues(this._fields, (field) => field._create())
    const state = new ImpulseFormShapeState(
      mapValues(fields, (field) => field._state),
      this._constants,
    )

    return new ImpulseFormShape(this, state, fields)
  }
}
