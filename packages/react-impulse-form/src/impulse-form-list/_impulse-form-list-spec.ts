import { isBoolean } from "~/tools/is-boolean"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { Lazy } from "~/tools/lazy"
import { Option, Some } from "~/tools/option"
import { resolveSetter } from "~/tools/setter"

import { Impulse, untrack } from "../dependencies"
import type { GetImpulseFormParams } from "../impulse-form/get-impulse-form-params"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type {
  ImpulseFormSpec,
  ImpulseFormSpecPatch,
} from "../impulse-form/impulse-form-spec"
import type { ImpulseFormState } from "../impulse-form/impulse-form-state"

import { ImpulseFormList } from "./_impulse-form-list"
import type { ImpulseFormListParams } from "./_impulse-form-list-params"
import { ImpulseForListState } from "./_impulse-form-list-state"

export class ImpulseFormListSpec<TElement extends ImpulseForm>
  implements ImpulseFormSpec<ImpulseFormListParams<TElement>>
{
  public constructor(
    public readonly _elements: ReadonlyArray<
      Impulse<ImpulseFormSpec<GetImpulseFormParams<TElement>>>
    >,
  ) {}

  public readonly _initial = this._elements.map(
    (element) => untrack(element)._initial,
  )

  public readonly _input = this._elements.map(
    (element) => untrack(element)._input,
  )

  public readonly _error = this._elements.map(
    (element) => untrack(element)._error,
  )

  public readonly _validateOn = this._elements.map(
    (element) => untrack(element)._validateOn,
  )

  public readonly _touched = this._elements.map(
    (element) => untrack(element)._touched,
  )

  public _override({
    _input,
    _initial,
    _error,
    _validateOn,
    _touched,
  }: ImpulseFormSpecPatch<
    ImpulseFormListParams<TElement>
  >): ImpulseFormListSpec<TElement> {
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

    const elements = this._elements.map((element, index) => {
      const next = untrack(element)._override({
        _input: input._chain((arr) => {
          return Option(arr[index])
        }),

        _initial: initial._chain((arr) => {
          return Option(arr[index])
        }),

        _error: error._chain((arr) => {
          if (isNull(arr)) {
            return Some(null)
          }

          return Option(arr[index])
        }),

        _validateOn: validateOn._chain((arr) => {
          if (isString(arr)) {
            return Some(arr)
          }

          return Option(arr[index])
        }),

        _touched: touched._chain((arr) => {
          if (isBoolean(arr)) {
            return Some(arr)
          }

          return Option(arr[index])
        }),
      })

      return Impulse(next)
    })

    return new ImpulseFormListSpec(elements)
  }

  public _create(parent?: Lazy<ImpulseFormState>): ImpulseFormList<TElement> {
    const state = Lazy((): ImpulseForListState<TElement> => {
      return new ImpulseForListState(
        parent,
        Impulse((scope) =>
          elements.getValue(scope).map(({ _state }) => _state._peek()),
        ),
      )
    })

    const elements = Impulse(
      this._elements.map((element) => {
        return untrack(element)._create(state)
      }),
    )

    const spec = new ImpulseFormListSpec(
      untrack(elements).map(({ _spec }) => _spec),
    )

    return new ImpulseFormList(Impulse(spec), state, elements)
  }
}
