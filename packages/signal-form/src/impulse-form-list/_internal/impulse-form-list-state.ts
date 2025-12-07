import { Impulse, type Monitor, untracked } from "@owanturist/signal"

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
      untracked((monitor) =>
        map(elements, (element, index) => {
          const child = this._parentOf(element)

          child._replaceInitial(monitor, initialElements.at(index), true)

          return child
        }),
      ),
    )
  }

  public _childOf(parent: null | ImpulseFormState): ImpulseFormListState<TElement> {
    return new ImpulseFormListState(parent, untracked(this._elements))
  }

  public _getElements(monitor: Monitor): ReadonlyArray<TElement> {
    return map(this._elements.read(monitor), ({ _host }) => _host() as TElement)
  }

  public _getInitialElements(
    monitor: Monitor,
  ): ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>> {
    return this._initialElements.read(monitor)._list.read(monitor)
  }

  public readonly _initial = Impulse(
    (monitor): ImpulseFormListInput<TElement> =>
      map(this._getInitialElements(monitor), ({ _initial }) => _initial.read(monitor)),
  )

  public _replaceInitial(
    monitor: Monitor,
    state: undefined | ImpulseFormListState<TElement>,
    isMounting: boolean,
  ): void {
    if (state) {
      const elements = this._elements.read(monitor)
      const initialElements = state._initialElements.read(monitor)

      this._initialElements.update(initialElements)

      for (const [index, element] of entries(initialElements._list.read(monitor))) {
        elements.at(index)?._replaceInitial(monitor, element, isMounting)
      }
    }
  }

  public _setInitial(monitor: Monitor, setter: ImpulseFormListInputSetter<TElement>): void {
    const setters = isFunction(setter)
      ? setter(this._initial.read(monitor), this._input.read(monitor))
      : setter

    const elements = this._elements.read(monitor)
    const initialElements = this._initialElements.read(monitor)
    const initialElementsList = initialElements._list.read(monitor)

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

    initialElements._list.update(nextInitialElements)

    for (const [index, initial] of entries(setters)) {
      if (!isUndefined(initial)) {
        nextInitialElements.at(index)?._setInitial(monitor, initial)
      }
    }

    for (const [index, element] of entries(nextInitialElements)) {
      elements.at(index)?._replaceInitial(monitor, element, false)
    }
  }

  public readonly _input = Impulse(
    (monitor): ImpulseFormListInput<TElement> =>
      map(this._elements.read(monitor), ({ _input }) => _input.read(monitor)),
  )

  public _setInput(monitor: Monitor, setter: ImpulseFormListInputSetter<TElement>): void {
    const setters = isFunction(setter)
      ? setter(this._input.read(monitor), this._initial.read(monitor))
      : setter

    for (const [index, element] of entries(this._elements.read(monitor))) {
      const input = setters.at(index)

      if (!isUndefined(input)) {
        element._setInput(monitor, input)
      }
    }
  }

  public readonly _error = Impulse((monitor): ImpulseFormListError<TElement> => {
    const error = map(this._elements.read(monitor), ({ _error }) => _error.read(monitor))

    if (error.every(isNull)) {
      return null
    }

    return error
  })

  public readonly _errorVerbose = Impulse(
    (monitor): ImpulseFormListErrorVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _errorVerbose }) => _errorVerbose.read(monitor)),
  )

  public _setError(monitor: Monitor, setter: ImpulseFormListErrorSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._errorVerbose.read(monitor)) : setter

    for (const [index, element] of entries(this._elements.read(monitor))) {
      const error = isNull(setters) ? setters : setters.at(index)

      if (!isUndefined(error)) {
        element._setError(monitor, error)
      }
    }
  }

  public readonly _validateOn = Impulse((monitor): ImpulseFormListValidateOn<TElement> => {
    const validateOn = map(this._elements.read(monitor), ({ _validateOn }) =>
      _validateOn.read(monitor),
    )

    return toConcise(validateOn, isString, VALIDATE_ON_TOUCH)
  })

  public readonly _validateOnVerbose = Impulse(
    (monitor): ImpulseFormListValidateOnVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _validateOnVerbose }) =>
        _validateOnVerbose.read(monitor),
      ),
  )

  public _setValidateOn(monitor: Monitor, setter: ImpulseFormListValidateOnSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._validateOnVerbose.read(monitor)) : setter

    for (const [index, element] of entries(this._getInitialElements(monitor))) {
      const validateOn = isString(setters) ? setters : setters.at(index)

      if (!isUndefined(validateOn)) {
        element._setValidateOn(monitor, validateOn)
      }
    }

    for (const [index, element] of entries(this._elements.read(monitor))) {
      const validateOn = isString(setters) ? setters : setters.at(index)

      if (!isUndefined(validateOn)) {
        element._setValidateOn(monitor, validateOn)
      }
    }
  }

  public readonly _touched = Impulse((monitor): ImpulseFormListFlag<TElement> => {
    const touched = map(this._elements.read(monitor), ({ _touched }) => _touched.read(monitor))

    return toConcise(touched, isBoolean, false)
  })

  public readonly _touchedVerbose = Impulse(
    (monitor): ImpulseFormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _touchedVerbose }) => _touchedVerbose.read(monitor)),
  )

  public _setTouched(monitor: Monitor, setter: ImpulseFormListFlagSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._touchedVerbose.read(monitor)) : setter

    for (const [index, element] of entries(this._elements.read(monitor))) {
      const touched = isBoolean(setters) ? setters : setters.at(index)

      if (!isUndefined(touched)) {
        element._setTouched(monitor, touched)
      }
    }
  }

  public readonly _output = Impulse((monitor): null | ImpulseFormListOutput<TElement> => {
    const output = map(this._elements.read(monitor), ({ _output }) => _output.read(monitor))

    if (output.some(isNull)) {
      return null
    }

    return output
  })

  public readonly _outputVerbose = Impulse(
    (monitor): ImpulseFormListOutputVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _outputVerbose }) => _outputVerbose.read(monitor)),
  )

  public readonly _valid = Impulse((monitor): ImpulseFormListFlag<TElement> => {
    const valid = map(this._elements.read(monitor), ({ _valid }) => _valid.read(monitor))

    return toConcise(valid, isBoolean, false)
  })

  public readonly _validVerbose = Impulse(
    (monitor): ImpulseFormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _validVerbose }) => _validVerbose.read(monitor)),
  )

  public readonly _invalid = Impulse((monitor): ImpulseFormListFlag<TElement> => {
    const invalid = map(this._elements.read(monitor), ({ _invalid }) => _invalid.read(monitor))

    return toConcise(invalid, isBoolean, false)
  })

  public readonly _invalidVerbose = Impulse(
    (monitor): ImpulseFormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _invalidVerbose }) => _invalidVerbose.read(monitor)),
  )

  public readonly _validated = Impulse((monitor): ImpulseFormListFlag<TElement> => {
    const validated = map(this._elements.read(monitor), ({ _validated }) =>
      _validated.read(monitor),
    )

    return toConcise(validated, isBoolean, false)
  })

  public readonly _validatedVerbose = Impulse(
    (monitor): ImpulseFormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _validatedVerbose }) => _validatedVerbose.read(monitor)),
  )

  public _forceValidated(monitor: Monitor): void {
    for (const element of this._elements.read(monitor)) {
      element._forceValidated(monitor)
    }
  }

  public readonly _dirty = Impulse((monitor): ImpulseFormListFlag<TElement> => {
    const elements = this._elements.read(monitor)
    const initialElements = this._getInitialElements(monitor)

    const dirty = concat(
      map(elements, ({ _dirty, _dirtyOn }, index) => {
        if (index >= initialElements.length) {
          // added elements are always dirty
          return _dirtyOn.read(monitor)
        }

        return _dirty.read(monitor)
      }),

      // removed elements are always dirty
      map(drop(initialElements, elements.length), ({ _dirtyOn }) => _dirtyOn.read(monitor)),
    )

    return toConcise(dirty, isBoolean, false)
  })

  public readonly _dirtyVerbose = Impulse((monitor): ImpulseFormListFlagVerbose<TElement> => {
    const elements = this._elements.read(monitor)
    const initialElements = this._getInitialElements(monitor)

    return concat(
      map(elements, ({ _dirtyVerbose, _dirtyOnVerbose }, index) => {
        if (index >= initialElements.length) {
          // added elements are always dirty
          return _dirtyOnVerbose.read(monitor)
        }

        return _dirtyVerbose.read(monitor)
      }),

      // removed elements are always dirty
      map(drop(initialElements, elements.length), ({ _dirtyOnVerbose }) =>
        _dirtyOnVerbose.read(monitor),
      ),
    )
  })

  public readonly _dirtyOn = Impulse((monitor): ImpulseFormListFlag<TElement> => {
    const dirtyOn = map(this._getInitialElements(monitor), ({ _dirtyOn }) => _dirtyOn.read(monitor))

    return toConcise(dirtyOn, isBoolean, false)
  })

  public readonly _dirtyOnVerbose = Impulse(
    (monitor): ImpulseFormListFlagVerbose<TElement> =>
      map(this._getInitialElements(monitor), ({ _dirtyOnVerbose }) =>
        _dirtyOnVerbose.read(monitor),
      ),
  )

  public _reset(
    monitor: Monitor,
    resetter: undefined | ImpulseFormListInputSetter<TElement>,
  ): void {
    if (!isUndefined(resetter)) {
      this._setInitial(monitor, resetter)
    }

    const nextElements = this._getInitialElements(monitor)

    for (const element of nextElements) {
      element._reset(monitor, undefined)
    }

    this._elements.update(map(nextElements, (element) => this._parentOf(element)))
  }

  public _getChildren<TChildParams extends ImpulseFormParams>(
    monitor: Monitor,
  ): ReadonlyArray<ImpulseFormChild<TChildParams, ImpulseFormListParams<TElement>>> {
    return map(this._elements.read(monitor), (element, index) => ({
      _state: element as unknown as ImpulseFormState<TChildParams>,
      _mapToChild: (output) => output.at(index),
    }))
  }
}

export { ImpulseFormListState }
