import { Impulse, type Scope, untracked } from "@owanturist/signal"

import { concat } from "~/tools/concat"
import { drop } from "~/tools/drop"
import { entries } from "~/tools/entries"
import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"
import { map } from "~/tools/map"
import { take } from "~/tools/take"

import { toConcise } from "../../_internal/to-concise"
import type { GetImpulseFormParams } from "../../impulse-form/_internal/get-impulse-form-params"
import {
  type ImpulseFormChild,
  ImpulseFormState,
} from "../../impulse-form/_internal/impulse-form-state"
import type { ImpulseForm } from "../../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../../impulse-form/impulse-form-params"
import { VALIDATE_ON_TOUCH } from "../../validate-strategy"
import type { ImpulseFormListError } from "../impulse-form-list-error"
import type { ImpulseFormListErrorSetter } from "../impulse-form-list-error-setter"
import type { ImpulseFormListErrorVerbose } from "../impulse-form-list-error-verbose"
import type { ImpulseFormListFlag } from "../impulse-form-list-flag"
import type { ImpulseFormListFlagSetter } from "../impulse-form-list-flag-setter"
import type { ImpulseFormListFlagVerbose } from "../impulse-form-list-flag-verbose"
import type { ImpulseFormListInput } from "../impulse-form-list-input"
import type { ImpulseFormListInputSetter } from "../impulse-form-list-input-setter"
import type { ImpulseFormListOutput } from "../impulse-form-list-output"
import type { ImpulseFormListOutputVerbose } from "../impulse-form-list-output-verbose"
import type { ImpulseFormListParams } from "../impulse-form-list-params"
import type { ImpulseFormListValidateOn } from "../impulse-form-list-validate-on"
import type { ImpulseFormListValidateOnSetter } from "../impulse-form-list-validate-on-setter"
import type { ImpulseFormListValidateOnVerbose } from "../impulse-form-list-validate-on-verbose"

import { ImpulseFormList } from "./impulse-form-list"

class ImpulseFormListState<TElement extends ImpulseForm = ImpulseForm> extends ImpulseFormState<
  ImpulseFormListParams<TElement>
> {
  public readonly _host = Lazy(() => new ImpulseFormList(this))

  public readonly _elements: Impulse<
    ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>>
  >

  private readonly _initialElements: Impulse<{
    _list: Impulse<ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>>>
  }>

  public constructor(
    parent: null | ImpulseFormState,
    elements: ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>>,
  ) {
    super(parent)

    const initialElements = map(elements, (element) => element._clone())

    this._initialElements = Impulse({
      _list: Impulse(initialElements),
    })

    this._elements = Impulse(
      untracked((scope) =>
        map(elements, (element, index) => {
          const child = this._parentOf(element)

          child._replaceInitial(scope, initialElements.at(index), true)

          return child
        }),
      ),
    )
  }

  public _childOf(parent: null | ImpulseFormState): ImpulseFormListState<TElement> {
    return new ImpulseFormListState(parent, untracked(this._elements))
  }

  public _getElements(scope: Scope): ReadonlyArray<TElement> {
    return map(this._elements.read(scope), ({ _host }) => _host() as TElement)
  }

  public _getInitialElements(
    scope: Scope,
  ): ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>> {
    return this._initialElements.read(scope)._list.read(scope)
  }

  public readonly _initial = Impulse(
    (scope): ImpulseFormListInput<TElement> =>
      map(this._getInitialElements(scope), ({ _initial }) => _initial.read(scope)),
  )

  public _replaceInitial(
    scope: Scope,
    state: undefined | ImpulseFormListState<TElement>,
    isMounting: boolean,
  ): void {
    if (state) {
      const elements = this._elements.read(scope)
      const initialElements = state._initialElements.read(scope)

      this._initialElements.setValue(initialElements)

      for (const [index, element] of entries(initialElements._list.read(scope))) {
        elements.at(index)?._replaceInitial(scope, element, isMounting)
      }
    }
  }

  public _setInitial(scope: Scope, setter: ImpulseFormListInputSetter<TElement>): void {
    const setters = isFunction(setter)
      ? setter(this._initial.read(scope), this._input.read(scope))
      : setter

    const elements = this._elements.read(scope)
    const initialElements = this._initialElements.read(scope)
    const initialElementsList = initialElements._list.read(scope)

    const nextInitialElements = map(
      take(
        concat(
          initialElementsList,
          // fallback the initial elements to the current elements' tail
          drop(elements, initialElementsList.length),
        ),
        setters.length,
      ),
      (element) => element._clone(),
    )

    initialElements._list.setValue(nextInitialElements)

    for (const [index, initial] of entries(setters)) {
      if (!isUndefined(initial)) {
        nextInitialElements.at(index)?._setInitial(scope, initial)
      }
    }

    for (const [index, element] of entries(nextInitialElements)) {
      elements.at(index)?._replaceInitial(scope, element, false)
    }
  }

  public readonly _input = Impulse(
    (scope): ImpulseFormListInput<TElement> =>
      map(this._elements.read(scope), ({ _input }) => _input.read(scope)),
  )

  public _setInput(scope: Scope, setter: ImpulseFormListInputSetter<TElement>): void {
    const setters = isFunction(setter)
      ? setter(this._input.read(scope), this._initial.read(scope))
      : setter

    for (const [index, element] of entries(this._elements.read(scope))) {
      const input = setters.at(index)

      if (!isUndefined(input)) {
        element._setInput(scope, input)
      }
    }
  }

  public readonly _error = Impulse((scope): ImpulseFormListError<TElement> => {
    const error = map(this._elements.read(scope), ({ _error }) => _error.read(scope))

    if (error.every(isNull)) {
      return null
    }

    return error
  })

  public readonly _errorVerbose = Impulse(
    (scope): ImpulseFormListErrorVerbose<TElement> =>
      map(this._elements.read(scope), ({ _errorVerbose }) => _errorVerbose.read(scope)),
  )

  public _setError(scope: Scope, setter: ImpulseFormListErrorSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._errorVerbose.read(scope)) : setter

    for (const [index, element] of entries(this._elements.read(scope))) {
      const error = isNull(setters) ? setters : setters.at(index)

      if (!isUndefined(error)) {
        element._setError(scope, error)
      }
    }
  }

  public readonly _validateOn = Impulse((scope): ImpulseFormListValidateOn<TElement> => {
    const validateOn = map(this._elements.read(scope), ({ _validateOn }) => _validateOn.read(scope))

    return toConcise(validateOn, isString, VALIDATE_ON_TOUCH)
  })

  public readonly _validateOnVerbose = Impulse(
    (scope): ImpulseFormListValidateOnVerbose<TElement> =>
      map(this._elements.read(scope), ({ _validateOnVerbose }) => _validateOnVerbose.read(scope)),
  )

  public _setValidateOn(scope: Scope, setter: ImpulseFormListValidateOnSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._validateOnVerbose.read(scope)) : setter

    for (const [index, element] of entries(this._getInitialElements(scope))) {
      const validateOn = isString(setters) ? setters : setters.at(index)

      if (!isUndefined(validateOn)) {
        element._setValidateOn(scope, validateOn)
      }
    }

    for (const [index, element] of entries(this._elements.read(scope))) {
      const validateOn = isString(setters) ? setters : setters.at(index)

      if (!isUndefined(validateOn)) {
        element._setValidateOn(scope, validateOn)
      }
    }
  }

  public readonly _touched = Impulse((scope): ImpulseFormListFlag<TElement> => {
    const touched = map(this._elements.read(scope), ({ _touched }) => _touched.read(scope))

    return toConcise(touched, isBoolean, false)
  })

  public readonly _touchedVerbose = Impulse(
    (scope): ImpulseFormListFlagVerbose<TElement> =>
      map(this._elements.read(scope), ({ _touchedVerbose }) => _touchedVerbose.read(scope)),
  )

  public _setTouched(scope: Scope, setter: ImpulseFormListFlagSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._touchedVerbose.read(scope)) : setter

    for (const [index, element] of entries(this._elements.read(scope))) {
      const touched = isBoolean(setters) ? setters : setters.at(index)

      if (!isUndefined(touched)) {
        element._setTouched(scope, touched)
      }
    }
  }

  public readonly _output = Impulse((scope): null | ImpulseFormListOutput<TElement> => {
    const output = map(this._elements.read(scope), ({ _output }) => _output.read(scope))

    if (output.some(isNull)) {
      return null
    }

    return output
  })

  public readonly _outputVerbose = Impulse(
    (scope): ImpulseFormListOutputVerbose<TElement> =>
      map(this._elements.read(scope), ({ _outputVerbose }) => _outputVerbose.read(scope)),
  )

  public readonly _valid = Impulse((scope): ImpulseFormListFlag<TElement> => {
    const valid = map(this._elements.read(scope), ({ _valid }) => _valid.read(scope))

    return toConcise(valid, isBoolean, false)
  })

  public readonly _validVerbose = Impulse(
    (scope): ImpulseFormListFlagVerbose<TElement> =>
      map(this._elements.read(scope), ({ _validVerbose }) => _validVerbose.read(scope)),
  )

  public readonly _invalid = Impulse((scope): ImpulseFormListFlag<TElement> => {
    const invalid = map(this._elements.read(scope), ({ _invalid }) => _invalid.read(scope))

    return toConcise(invalid, isBoolean, false)
  })

  public readonly _invalidVerbose = Impulse(
    (scope): ImpulseFormListFlagVerbose<TElement> =>
      map(this._elements.read(scope), ({ _invalidVerbose }) => _invalidVerbose.read(scope)),
  )

  public readonly _validated = Impulse((scope): ImpulseFormListFlag<TElement> => {
    const validated = map(this._elements.read(scope), ({ _validated }) => _validated.read(scope))

    return toConcise(validated, isBoolean, false)
  })

  public readonly _validatedVerbose = Impulse(
    (scope): ImpulseFormListFlagVerbose<TElement> =>
      map(this._elements.read(scope), ({ _validatedVerbose }) => _validatedVerbose.read(scope)),
  )

  public _forceValidated(scope: Scope): void {
    for (const element of this._elements.read(scope)) {
      element._forceValidated(scope)
    }
  }

  public readonly _dirty = Impulse((scope): ImpulseFormListFlag<TElement> => {
    const elements = this._elements.read(scope)
    const initialElements = this._getInitialElements(scope)

    const dirty = concat(
      map(elements, ({ _dirty, _dirtyOn }, index) => {
        if (index >= initialElements.length) {
          // added elements are always dirty
          return _dirtyOn.read(scope)
        }

        return _dirty.read(scope)
      }),

      // removed elements are always dirty
      map(drop(initialElements, elements.length), ({ _dirtyOn }) => _dirtyOn.read(scope)),
    )

    return toConcise(dirty, isBoolean, false)
  })

  public readonly _dirtyVerbose = Impulse((scope): ImpulseFormListFlagVerbose<TElement> => {
    const elements = this._elements.read(scope)
    const initialElements = this._getInitialElements(scope)

    return concat(
      map(elements, ({ _dirtyVerbose, _dirtyOnVerbose }, index) => {
        if (index >= initialElements.length) {
          // added elements are always dirty
          return _dirtyOnVerbose.read(scope)
        }

        return _dirtyVerbose.read(scope)
      }),

      // removed elements are always dirty
      map(drop(initialElements, elements.length), ({ _dirtyOnVerbose }) =>
        _dirtyOnVerbose.read(scope),
      ),
    )
  })

  public readonly _dirtyOn = Impulse((scope): ImpulseFormListFlag<TElement> => {
    const dirtyOn = map(this._getInitialElements(scope), ({ _dirtyOn }) => _dirtyOn.read(scope))

    return toConcise(dirtyOn, isBoolean, false)
  })

  public readonly _dirtyOnVerbose = Impulse(
    (scope): ImpulseFormListFlagVerbose<TElement> =>
      map(this._getInitialElements(scope), ({ _dirtyOnVerbose }) => _dirtyOnVerbose.read(scope)),
  )

  public _reset(scope: Scope, resetter: undefined | ImpulseFormListInputSetter<TElement>): void {
    if (!isUndefined(resetter)) {
      this._setInitial(scope, resetter)
    }

    const nextElements = this._getInitialElements(scope)

    for (const element of nextElements) {
      element._reset(scope, undefined)
    }

    this._elements.setValue(map(nextElements, (element) => this._parentOf(element)))
  }

  public _getChildren<TChildParams extends ImpulseFormParams>(
    scope: Scope,
  ): ReadonlyArray<ImpulseFormChild<TChildParams, ImpulseFormListParams<TElement>>> {
    return map(this._elements.read(scope), (element, index) => ({
      _state: element as unknown as ImpulseFormState<TChildParams>,
      _mapToChild: (output) => output.at(index),
    }))
  }
}

export { ImpulseFormListState }
