import { type Monitor, Signal, untracked } from "@owanturist/signal"

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
import type { GetSignalFormParams } from "../../impulse-form/_internal/get-impulse-form-params"
import {
  type SignalFormChild,
  SignalFormState,
} from "../../impulse-form/_internal/impulse-form-state"
import type { SignalForm } from "../../impulse-form/impulse-form"
import type { SignalFormParams } from "../../impulse-form/impulse-form-params"
import { VALIDATE_ON_TOUCH } from "../../validate-strategy"
import type { FormListError } from "../impulse-form-list-error"
import type { FormListErrorSetter } from "../impulse-form-list-error-setter"
import type { FormListErrorVerbose } from "../impulse-form-list-error-verbose"
import type { FormListFlag } from "../impulse-form-list-flag"
import type { FormListFlagSetter } from "../impulse-form-list-flag-setter"
import type { FormListFlagVerbose } from "../impulse-form-list-flag-verbose"
import type { FormListInput } from "../impulse-form-list-input"
import type { FormListInputSetter } from "../impulse-form-list-input-setter"
import type { FormListOutput } from "../impulse-form-list-output"
import type { FormListOutputVerbose } from "../impulse-form-list-output-verbose"
import type { FormListParams } from "../impulse-form-list-params"
import type { FormListValidateOn } from "../impulse-form-list-validate-on"
import type { FormListValidateOnSetter } from "../impulse-form-list-validate-on-setter"
import type { FormListValidateOnVerbose } from "../impulse-form-list-validate-on-verbose"

import { FormList } from "./impulse-form-list"

class FormListState<TElement extends SignalForm = SignalForm> extends SignalFormState<
  FormListParams<TElement>
> {
  public readonly _host = Lazy(() => new FormList(this))

  public readonly _elements: Signal<ReadonlyArray<SignalFormState<GetSignalFormParams<TElement>>>>

  private readonly _initialElements: Signal<{
    _list: Signal<ReadonlyArray<SignalFormState<GetSignalFormParams<TElement>>>>
  }>

  public constructor(
    parent: null | SignalFormState,
    elements: ReadonlyArray<SignalFormState<GetSignalFormParams<TElement>>>,
  ) {
    super(parent)

    const initialElements = map(elements, (element) => element._clone())

    this._initialElements = Signal({
      _list: Signal(initialElements),
    })

    this._elements = Signal(
      untracked((monitor) =>
        map(elements, (element, index) => {
          const child = this._parentOf(element)

          child._replaceInitial(monitor, initialElements.at(index), true)

          return child
        }),
      ),
    )
  }

  public _childOf(parent: null | SignalFormState): FormListState<TElement> {
    return new FormListState(parent, untracked(this._elements))
  }

  public _getElements(monitor: Monitor): ReadonlyArray<TElement> {
    return map(this._elements.read(monitor), ({ _host }) => _host() as TElement)
  }

  public _getInitialElements(
    monitor: Monitor,
  ): ReadonlyArray<SignalFormState<GetSignalFormParams<TElement>>> {
    return this._initialElements.read(monitor)._list.read(monitor)
  }

  public readonly _initial = Signal(
    (monitor): FormListInput<TElement> =>
      map(this._getInitialElements(monitor), ({ _initial }) => _initial.read(monitor)),
  )

  public _replaceInitial(
    monitor: Monitor,
    state: undefined | FormListState<TElement>,
    isMounting: boolean,
  ): void {
    if (state) {
      const elements = this._elements.read(monitor)
      const initialElements = state._initialElements.read(monitor)

      this._initialElements.write(initialElements)

      for (const [index, element] of entries(initialElements._list.read(monitor))) {
        elements.at(index)?._replaceInitial(monitor, element, isMounting)
      }
    }
  }

  public _setInitial(monitor: Monitor, setter: FormListInputSetter<TElement>): void {
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

    initialElements._list.write(nextInitialElements)

    for (const [index, initial] of entries(setters)) {
      if (!isUndefined(initial)) {
        nextInitialElements.at(index)?._setInitial(monitor, initial)
      }
    }

    for (const [index, element] of entries(nextInitialElements)) {
      elements.at(index)?._replaceInitial(monitor, element, false)
    }
  }

  public readonly _input = Signal(
    (monitor): FormListInput<TElement> =>
      map(this._elements.read(monitor), ({ _input }) => _input.read(monitor)),
  )

  public _setInput(monitor: Monitor, setter: FormListInputSetter<TElement>): void {
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

  public readonly _error = Signal((monitor): FormListError<TElement> => {
    const error = map(this._elements.read(monitor), ({ _error }) => _error.read(monitor))

    if (error.every(isNull)) {
      return null
    }

    return error
  })

  public readonly _errorVerbose = Signal(
    (monitor): FormListErrorVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _errorVerbose }) => _errorVerbose.read(monitor)),
  )

  public _setError(monitor: Monitor, setter: FormListErrorSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._errorVerbose.read(monitor)) : setter

    for (const [index, element] of entries(this._elements.read(monitor))) {
      const error = isNull(setters) ? setters : setters.at(index)

      if (!isUndefined(error)) {
        element._setError(monitor, error)
      }
    }
  }

  public readonly _validateOn = Signal((monitor): FormListValidateOn<TElement> => {
    const validateOn = map(this._elements.read(monitor), ({ _validateOn }) =>
      _validateOn.read(monitor),
    )

    return toConcise(validateOn, isString, VALIDATE_ON_TOUCH)
  })

  public readonly _validateOnVerbose = Signal(
    (monitor): FormListValidateOnVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _validateOnVerbose }) =>
        _validateOnVerbose.read(monitor),
      ),
  )

  public _setValidateOn(monitor: Monitor, setter: FormListValidateOnSetter<TElement>): void {
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

  public readonly _touched = Signal((monitor): FormListFlag<TElement> => {
    const touched = map(this._elements.read(monitor), ({ _touched }) => _touched.read(monitor))

    return toConcise(touched, isBoolean, false)
  })

  public readonly _touchedVerbose = Signal(
    (monitor): FormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _touchedVerbose }) => _touchedVerbose.read(monitor)),
  )

  public _setTouched(monitor: Monitor, setter: FormListFlagSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._touchedVerbose.read(monitor)) : setter

    for (const [index, element] of entries(this._elements.read(monitor))) {
      const touched = isBoolean(setters) ? setters : setters.at(index)

      if (!isUndefined(touched)) {
        element._setTouched(monitor, touched)
      }
    }
  }

  public readonly _output = Signal((monitor): null | FormListOutput<TElement> => {
    const output = map(this._elements.read(monitor), ({ _output }) => _output.read(monitor))

    if (output.some(isNull)) {
      return null
    }

    return output
  })

  public readonly _outputVerbose = Signal(
    (monitor): FormListOutputVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _outputVerbose }) => _outputVerbose.read(monitor)),
  )

  public readonly _valid = Signal((monitor): FormListFlag<TElement> => {
    const valid = map(this._elements.read(monitor), ({ _valid }) => _valid.read(monitor))

    return toConcise(valid, isBoolean, false)
  })

  public readonly _validVerbose = Signal(
    (monitor): FormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _validVerbose }) => _validVerbose.read(monitor)),
  )

  public readonly _invalid = Signal((monitor): FormListFlag<TElement> => {
    const invalid = map(this._elements.read(monitor), ({ _invalid }) => _invalid.read(monitor))

    return toConcise(invalid, isBoolean, false)
  })

  public readonly _invalidVerbose = Signal(
    (monitor): FormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _invalidVerbose }) => _invalidVerbose.read(monitor)),
  )

  public readonly _validated = Signal((monitor): FormListFlag<TElement> => {
    const validated = map(this._elements.read(monitor), ({ _validated }) =>
      _validated.read(monitor),
    )

    return toConcise(validated, isBoolean, false)
  })

  public readonly _validatedVerbose = Signal(
    (monitor): FormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _validatedVerbose }) => _validatedVerbose.read(monitor)),
  )

  public _forceValidated(monitor: Monitor): void {
    for (const element of this._elements.read(monitor)) {
      element._forceValidated(monitor)
    }
  }

  public readonly _dirty = Signal((monitor): FormListFlag<TElement> => {
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

  public readonly _dirtyVerbose = Signal((monitor): FormListFlagVerbose<TElement> => {
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

  public readonly _dirtyOn = Signal((monitor): FormListFlag<TElement> => {
    const dirtyOn = map(this._getInitialElements(monitor), ({ _dirtyOn }) => _dirtyOn.read(monitor))

    return toConcise(dirtyOn, isBoolean, false)
  })

  public readonly _dirtyOnVerbose = Signal(
    (monitor): FormListFlagVerbose<TElement> =>
      map(this._getInitialElements(monitor), ({ _dirtyOnVerbose }) =>
        _dirtyOnVerbose.read(monitor),
      ),
  )

  public _reset(monitor: Monitor, resetter: undefined | FormListInputSetter<TElement>): void {
    if (!isUndefined(resetter)) {
      this._setInitial(monitor, resetter)
    }

    const nextElements = this._getInitialElements(monitor)

    for (const element of nextElements) {
      element._reset(monitor, undefined)
    }

    this._elements.write(map(nextElements, (element) => this._parentOf(element)))
  }

  public _getChildren<TChildParams extends SignalFormParams>(
    monitor: Monitor,
  ): ReadonlyArray<SignalFormChild<TChildParams, FormListParams<TElement>>> {
    return map(this._elements.read(monitor), (element, index) => ({
      _state: element as unknown as SignalFormState<TChildParams>,
      _mapToChild: (output) => output.at(index),
    }))
  }
}

export { FormListState }
