import { type Monitor, type ReadableSignal, Signal } from "@owanturist/signal"

import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { isTrue } from "~/tools/is-true"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"

import { toConcise } from "../../_internal/to-concise"
import type { GetSignalFormParams } from "../../impulse-form/_internal/get-impulse-form-params"
import {
  type SignalFormChild,
  SignalFormState,
} from "../../impulse-form/_internal/impulse-form-state"
import type { SignalForm } from "../../impulse-form/impulse-form"
import type { SignalFormParams } from "../../impulse-form/impulse-form-params"
import type { ValidateStrategy } from "../../validate-strategy"
import type { FormOptionalError } from "../impulse-form-optional-error"
import type { FormOptionalErrorSetter } from "../impulse-form-optional-error-setter"
import type { FormOptionalErrorVerbose } from "../impulse-form-optional-error-verbose"
import type { FormOptionalFlag } from "../impulse-form-optional-flag"
import type { FormOptionalFlagSetter } from "../impulse-form-optional-flag-setter"
import type { FormOptionalFlagVerbose } from "../impulse-form-optional-flag-verbose"
import type { FormOptionalInput } from "../impulse-form-optional-input"
import type { FormOptionalInputSetter } from "../impulse-form-optional-input-setter"
import type { FormOptionalOutput } from "../impulse-form-optional-output"
import type { FormOptionalOutputVerbose } from "../impulse-form-optional-output-verbose"
import type { FormOptionalParams } from "../impulse-form-optional-params"
import type { FormOptionalValidateOn } from "../impulse-form-optional-validate-on"
import type { FormOptionalValidateOnSetter } from "../impulse-form-optional-validate-on-setter"
import type { FormOptionalValidateOnVerbose } from "../impulse-form-optional-validate-on-verbose"

import { FormOptional } from "./impulse-form-optional"

class FormOptionalState<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> extends SignalFormState<FormOptionalParams<TEnabled, TElement>> {
  public readonly _host = Lazy(() => new FormOptional(this))

  public readonly _enabled: SignalFormState<GetSignalFormParams<TEnabled>>
  public readonly _element: SignalFormState<GetSignalFormParams<TElement>>

  public constructor(
    parent: null | SignalFormState,
    enabled: SignalFormState<GetSignalFormParams<TEnabled>>,
    element: SignalFormState<GetSignalFormParams<TElement>>,
  ) {
    super(parent)

    this._enabled = this._parentOf(enabled)
    this._element = this._parentOf(element)
  }

  private _isEnabled(monitor: Monitor): boolean {
    return isTrue(this._enabled._output.read(monitor))
  }

  public _getEnabledElement(
    monitor: Monitor,
  ): undefined | SignalFormState<GetSignalFormParams<TElement>> {
    return this._isEnabled(monitor) ? this._element : undefined
  }

  public _childOf(parent: null | SignalFormState): FormOptionalState<TEnabled, TElement> {
    return new FormOptionalState(parent, this._enabled, this._element)
  }

  private _toConcise<TConcise>(
    monitor: Monitor,
    extract: (form: SignalFormState) => ReadableSignal<TConcise>,
    isConcise: (value: unknown) => value is TConcise,
    fallbackDisabled?: TConcise,
  ): TConcise | { enabled: TConcise; element: TConcise } {
    const enabled = extract(this._enabled).read(monitor)
    const enabledElement = this._getEnabledElement(monitor)

    if (!enabledElement) {
      return isConcise(enabled) || isUndefined(fallbackDisabled)
        ? enabled
        : { enabled, element: fallbackDisabled }
    }

    const element = extract(enabledElement).read(monitor)

    return toConcise([enabled, element], isConcise, enabled, {
      enabled,
      element,
    }) as TConcise | { enabled: TConcise; element: TConcise }
  }

  private _toVerbose(
    monitor: Monitor,
    extract: (form: SignalFormState) => ReadableSignal<unknown>,
  ): FormOptionalInput<TEnabled, TElement> {
    const enabled = extract(this._enabled).read(monitor)
    const element = extract(this._element).read(monitor)

    return { enabled, element } as FormOptionalInput<TEnabled, TElement>
  }

  // I N I T I A L

  public readonly _initial = Signal(
    (monitor): FormOptionalInput<TEnabled, TElement> =>
      this._toVerbose(monitor, ({ _initial }) => _initial),
  )

  public _setInitial(monitor: Monitor, setter: FormOptionalInputSetter<TEnabled, TElement>): void {
    const { enabled, element } = isFunction(setter)
      ? setter(this._initial.read(monitor), this._input.read(monitor))
      : setter

    if (!isUndefined(enabled)) {
      this._enabled._setInitial(monitor, enabled)
    }

    if (!isUndefined(element)) {
      this._element._setInitial(monitor, element)
    }
  }

  public _replaceInitial(
    monitor: Monitor,
    state: undefined | FormOptionalState<TEnabled, TElement>,
    isMounting: boolean,
  ): void {
    this._enabled._replaceInitial(monitor, state?._enabled, isMounting)
    this._element._replaceInitial(monitor, state?._element, isMounting)
  }

  // I N P U T

  public readonly _input = Signal(
    (monitor): FormOptionalInput<TEnabled, TElement> =>
      this._toVerbose(monitor, ({ _input }) => _input),
  )

  public _setInput(monitor: Monitor, setter: FormOptionalInputSetter<TEnabled, TElement>): void {
    const { enabled, element } = isFunction(setter)
      ? setter(this._input.read(monitor), this._initial.read(monitor))
      : setter

    if (!isUndefined(enabled)) {
      this._enabled._setInput(monitor, enabled)
    }

    if (!isUndefined(element)) {
      this._element._setInput(monitor, element)
    }
  }

  // E R R O R

  public readonly _error = Signal(
    (monitor): FormOptionalError<TEnabled, TElement> =>
      this._toConcise<null>(monitor, ({ _error }) => _error, isNull, null) as FormOptionalError<
        TEnabled,
        TElement
      >,
  )

  public readonly _errorVerbose = Signal(
    (monitor): FormOptionalErrorVerbose<TEnabled, TElement> =>
      this._toVerbose(monitor, ({ _errorVerbose }) => _errorVerbose) as FormOptionalErrorVerbose<
        TEnabled,
        TElement
      >,
  )

  public _setError(monitor: Monitor, setter: FormOptionalErrorSetter<TEnabled, TElement>): void {
    const resolved = isFunction(setter) ? setter(this._errorVerbose.read(monitor)) : setter

    const enabledSetter = isNull(resolved) ? resolved : resolved.enabled

    if (!isUndefined(enabledSetter)) {
      this._enabled._setError(monitor, enabledSetter)
    }

    const elementSetter = isNull(resolved)
      ? this._isEnabled(monitor)
        ? resolved
        : undefined
      : resolved.element

    if (!isUndefined(elementSetter)) {
      this._element._setError(monitor, elementSetter)
    }
  }

  // V A L I D A T E   O N

  public readonly _validateOn = Signal(
    (monitor): FormOptionalValidateOn<TEnabled, TElement> =>
      this._toConcise<ValidateStrategy>(
        monitor,
        ({ _validateOn }) => _validateOn,
        isString as (value: unknown) => value is ValidateStrategy,
      ) as FormOptionalValidateOn<TEnabled, TElement>,
  )

  public readonly _validateOnVerbose = Signal(
    (monitor): FormOptionalValidateOnVerbose<TEnabled, TElement> =>
      this._toVerbose(
        monitor,
        ({ _validateOnVerbose }) => _validateOnVerbose,
      ) as FormOptionalValidateOnVerbose<TEnabled, TElement>,
  )

  public _setValidateOn(
    monitor: Monitor,
    setter: FormOptionalValidateOnSetter<TEnabled, TElement>,
  ): void {
    const resolved = isFunction(setter) ? setter(this._validateOnVerbose.read(monitor)) : setter

    const [enabledSetter, elementSetter] = isString(resolved)
      ? [resolved, this._isEnabled(monitor) ? resolved : undefined]
      : [resolved.enabled, resolved.element]

    if (!isUndefined(enabledSetter)) {
      this._enabled._setValidateOn(monitor, enabledSetter)
    }

    if (!isUndefined(elementSetter)) {
      this._element._setValidateOn(monitor, elementSetter)
    }
  }

  // T O U C H E D

  public readonly _touched = Signal(
    (monitor): FormOptionalFlag<TEnabled, TElement> =>
      this._toConcise<boolean>(monitor, ({ _touched }) => _touched, isBoolean) as FormOptionalFlag<
        TEnabled,
        TElement
      >,
  )

  public readonly _touchedVerbose = Signal(
    (monitor): FormOptionalFlagVerbose<TEnabled, TElement> =>
      this._toVerbose(monitor, ({ _touchedVerbose }) => _touchedVerbose) as FormOptionalFlagVerbose<
        TEnabled,
        TElement
      >,
  )

  public _setTouched(monitor: Monitor, setter: FormOptionalFlagSetter<TEnabled, TElement>): void {
    const resolved = isFunction(setter) ? setter(this._touchedVerbose.read(monitor)) : setter

    const [enabledSetter, elementSetter] = isBoolean(resolved)
      ? [resolved, this._isEnabled(monitor) ? resolved : undefined]
      : [resolved.enabled, resolved.element]

    if (!isUndefined(enabledSetter)) {
      this._enabled._setTouched(monitor, enabledSetter)
    }

    if (!isUndefined(elementSetter)) {
      this._element._setTouched(monitor, elementSetter)
    }
  }

  // O U T P U T

  public readonly _output = Signal((monitor): null | FormOptionalOutput<TElement> => {
    const enabled = this._enabled._output.read(monitor)

    if (enabled === false) {
      return undefined
    }

    if (isNull(enabled)) {
      return null
    }

    const value = this._element._output.read(monitor)

    if (isNull(value)) {
      return null
    }

    return value
  })

  public readonly _outputVerbose = Signal(
    (monitor): FormOptionalOutputVerbose<TEnabled, TElement> =>
      this._toVerbose(monitor, ({ _outputVerbose }) => _outputVerbose),
  )

  // V A L I D

  public readonly _valid = Signal(
    (monitor): FormOptionalFlag<TEnabled, TElement> =>
      this._toConcise<boolean>(monitor, ({ _valid }) => _valid, isBoolean) as FormOptionalFlag<
        TEnabled,
        TElement
      >,
  )

  public readonly _validVerbose = Signal(
    (monitor): FormOptionalFlagVerbose<TEnabled, TElement> =>
      this._toVerbose(monitor, ({ _validVerbose }) => _validVerbose) as FormOptionalFlagVerbose<
        TEnabled,
        TElement
      >,
  )

  // I N V A L I D

  public readonly _invalid = Signal(
    (monitor): FormOptionalFlag<TEnabled, TElement> =>
      this._toConcise<boolean>(monitor, ({ _invalid }) => _invalid, isBoolean) as FormOptionalFlag<
        TEnabled,
        TElement
      >,
  )

  public readonly _invalidVerbose = Signal(
    (monitor): FormOptionalFlagVerbose<TEnabled, TElement> =>
      this._toVerbose(monitor, ({ _invalidVerbose }) => _invalidVerbose) as FormOptionalFlagVerbose<
        TEnabled,
        TElement
      >,
  )

  // V A L I D A T E D

  public readonly _validated = Signal(
    (monitor): FormOptionalFlag<TEnabled, TElement> =>
      this._toConcise<boolean>(
        monitor,
        ({ _validated }) => _validated,
        isBoolean,
      ) as FormOptionalFlag<TEnabled, TElement>,
  )

  public readonly _validatedVerbose = Signal(
    (monitor): FormOptionalFlagVerbose<TEnabled, TElement> =>
      this._toVerbose(
        monitor,
        ({ _validatedVerbose }) => _validatedVerbose,
      ) as FormOptionalFlagVerbose<TEnabled, TElement>,
  )

  public _forceValidated(monitor: Monitor): void {
    this._enabled._forceValidated(monitor)
    this._element._forceValidated(monitor)
  }

  // D I R T Y

  public readonly _dirty = Signal(
    (monitor): FormOptionalFlag<TEnabled, TElement> =>
      this._toConcise<boolean>(monitor, ({ _dirty }) => _dirty, isBoolean) as FormOptionalFlag<
        TEnabled,
        TElement
      >,
  )

  public readonly _dirtyVerbose = Signal(
    (monitor): FormOptionalFlagVerbose<TEnabled, TElement> =>
      this._toVerbose(monitor, ({ _dirtyVerbose }) => _dirtyVerbose) as FormOptionalFlagVerbose<
        TEnabled,
        TElement
      >,
  )

  public readonly _dirtyOn = Signal(
    (monitor): FormOptionalFlag<TEnabled, TElement> =>
      this._toConcise<boolean>(monitor, ({ _dirtyOn }) => _dirtyOn, isBoolean) as FormOptionalFlag<
        TEnabled,
        TElement
      >,
  )

  public readonly _dirtyOnVerbose = Signal(
    (monitor): FormOptionalFlagVerbose<TEnabled, TElement> =>
      this._toVerbose(monitor, ({ _dirtyOnVerbose }) => _dirtyOnVerbose) as FormOptionalFlagVerbose<
        TEnabled,
        TElement
      >,
  )

  // R E S E T

  public _reset(
    monitor: Monitor,
    resetter: undefined | FormOptionalInputSetter<TEnabled, TElement>,
  ): void {
    if (!isUndefined(resetter)) {
      this._setInitial(monitor, resetter)
    }

    this._enabled._reset(monitor, undefined)
    this._element._reset(monitor, undefined)
  }

  // C H I L D R E N

  public _getChildren<TChildParams extends SignalFormParams>(
    monitor: Monitor,
  ): ReadonlyArray<SignalFormChild<TChildParams, FormOptionalParams<TEnabled, TElement>>> {
    const enabledValue = this._enabled._output.read(monitor)

    const enabledChild: SignalFormChild<TChildParams, FormOptionalParams<TEnabled, TElement>> = {
      _state: this._enabled as unknown as SignalFormState<TChildParams>,
      _mapToChild: () => enabledValue as unknown as TChildParams["output.schema"],
    }

    if (enabledValue !== true) {
      return [enabledChild]
    }

    return [
      enabledChild,
      {
        _state: this._element as unknown as SignalFormState<TChildParams>,
        _mapToChild: (output) => output,
      },
    ]
  }
}

export { FormOptionalState }
