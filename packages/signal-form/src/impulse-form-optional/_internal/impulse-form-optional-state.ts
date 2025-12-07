import { Impulse, type Monitor, type ReadonlyImpulse } from "@owanturist/signal"

import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { isTrue } from "~/tools/is-true"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"

import { toConcise } from "../../_internal/to-concise"
import type { GetImpulseFormParams } from "../../impulse-form/_internal/get-impulse-form-params"
import {
  type ImpulseFormChild,
  ImpulseFormState,
} from "../../impulse-form/_internal/impulse-form-state"
import type { ImpulseForm } from "../../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../../impulse-form/impulse-form-params"
import type { ValidateStrategy } from "../../validate-strategy"
import type { ImpulseFormOptionalError } from "../impulse-form-optional-error"
import type { ImpulseFormOptionalErrorSetter } from "../impulse-form-optional-error-setter"
import type { ImpulseFormOptionalErrorVerbose } from "../impulse-form-optional-error-verbose"
import type { ImpulseFormOptionalFlag } from "../impulse-form-optional-flag"
import type { ImpulseFormOptionalFlagSetter } from "../impulse-form-optional-flag-setter"
import type { ImpulseFormOptionalFlagVerbose } from "../impulse-form-optional-flag-verbose"
import type { ImpulseFormOptionalInput } from "../impulse-form-optional-input"
import type { ImpulseFormOptionalInputSetter } from "../impulse-form-optional-input-setter"
import type { ImpulseFormOptionalOutput } from "../impulse-form-optional-output"
import type { ImpulseFormOptionalOutputVerbose } from "../impulse-form-optional-output-verbose"
import type { ImpulseFormOptionalParams } from "../impulse-form-optional-params"
import type { ImpulseFormOptionalValidateOn } from "../impulse-form-optional-validate-on"
import type { ImpulseFormOptionalValidateOnSetter } from "../impulse-form-optional-validate-on-setter"
import type { ImpulseFormOptionalValidateOnVerbose } from "../impulse-form-optional-validate-on-verbose"

import { ImpulseFormOptional } from "./impulse-form-optional"

class ImpulseFormOptionalState<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> extends ImpulseFormState<ImpulseFormOptionalParams<TEnabled, TElement>> {
  public readonly _host = Lazy(() => new ImpulseFormOptional(this))

  public readonly _enabled: ImpulseFormState<GetImpulseFormParams<TEnabled>>
  public readonly _element: ImpulseFormState<GetImpulseFormParams<TElement>>

  public constructor(
    parent: null | ImpulseFormState,
    enabled: ImpulseFormState<GetImpulseFormParams<TEnabled>>,
    element: ImpulseFormState<GetImpulseFormParams<TElement>>,
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
  ): undefined | ImpulseFormState<GetImpulseFormParams<TElement>> {
    return this._isEnabled(monitor) ? this._element : undefined
  }

  public _childOf(parent: null | ImpulseFormState): ImpulseFormOptionalState<TEnabled, TElement> {
    return new ImpulseFormOptionalState(parent, this._enabled, this._element)
  }

  private _toConcise<TConcise>(
    monitor: Monitor,
    extract: (form: ImpulseFormState) => ReadonlyImpulse<TConcise>,
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
    extract: (form: ImpulseFormState) => ReadonlyImpulse<unknown>,
  ): ImpulseFormOptionalInput<TEnabled, TElement> {
    const enabled = extract(this._enabled).read(monitor)
    const element = extract(this._element).read(monitor)

    return { enabled, element } as ImpulseFormOptionalInput<TEnabled, TElement>
  }

  // I N I T I A L

  public readonly _initial = Impulse(
    (monitor): ImpulseFormOptionalInput<TEnabled, TElement> =>
      this._toVerbose(monitor, ({ _initial }) => _initial),
  )

  public _setInitial(
    monitor: Monitor,
    setter: ImpulseFormOptionalInputSetter<TEnabled, TElement>,
  ): void {
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
    state: undefined | ImpulseFormOptionalState<TEnabled, TElement>,
    isMounting: boolean,
  ): void {
    this._enabled._replaceInitial(monitor, state?._enabled, isMounting)
    this._element._replaceInitial(monitor, state?._element, isMounting)
  }

  // I N P U T

  public readonly _input = Impulse(
    (monitor): ImpulseFormOptionalInput<TEnabled, TElement> =>
      this._toVerbose(monitor, ({ _input }) => _input),
  )

  public _setInput(
    monitor: Monitor,
    setter: ImpulseFormOptionalInputSetter<TEnabled, TElement>,
  ): void {
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

  public readonly _error = Impulse(
    (monitor): ImpulseFormOptionalError<TEnabled, TElement> =>
      this._toConcise<null>(
        monitor,
        ({ _error }) => _error,
        isNull,
        null,
      ) as ImpulseFormOptionalError<TEnabled, TElement>,
  )

  public readonly _errorVerbose = Impulse(
    (monitor): ImpulseFormOptionalErrorVerbose<TEnabled, TElement> =>
      this._toVerbose(
        monitor,
        ({ _errorVerbose }) => _errorVerbose,
      ) as ImpulseFormOptionalErrorVerbose<TEnabled, TElement>,
  )

  public _setError(
    monitor: Monitor,
    setter: ImpulseFormOptionalErrorSetter<TEnabled, TElement>,
  ): void {
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

  public readonly _validateOn = Impulse(
    (monitor): ImpulseFormOptionalValidateOn<TEnabled, TElement> =>
      this._toConcise<ValidateStrategy>(
        monitor,
        ({ _validateOn }) => _validateOn,
        isString as (value: unknown) => value is ValidateStrategy,
      ) as ImpulseFormOptionalValidateOn<TEnabled, TElement>,
  )

  public readonly _validateOnVerbose = Impulse(
    (monitor): ImpulseFormOptionalValidateOnVerbose<TEnabled, TElement> =>
      this._toVerbose(
        monitor,
        ({ _validateOnVerbose }) => _validateOnVerbose,
      ) as ImpulseFormOptionalValidateOnVerbose<TEnabled, TElement>,
  )

  public _setValidateOn(
    monitor: Monitor,
    setter: ImpulseFormOptionalValidateOnSetter<TEnabled, TElement>,
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

  public readonly _touched = Impulse(
    (monitor): ImpulseFormOptionalFlag<TEnabled, TElement> =>
      this._toConcise<boolean>(
        monitor,
        ({ _touched }) => _touched,
        isBoolean,
      ) as ImpulseFormOptionalFlag<TEnabled, TElement>,
  )

  public readonly _touchedVerbose = Impulse(
    (monitor): ImpulseFormOptionalFlagVerbose<TEnabled, TElement> =>
      this._toVerbose(
        monitor,
        ({ _touchedVerbose }) => _touchedVerbose,
      ) as ImpulseFormOptionalFlagVerbose<TEnabled, TElement>,
  )

  public _setTouched(
    monitor: Monitor,
    setter: ImpulseFormOptionalFlagSetter<TEnabled, TElement>,
  ): void {
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

  public readonly _output = Impulse((monitor): null | ImpulseFormOptionalOutput<TElement> => {
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

  public readonly _outputVerbose = Impulse(
    (monitor): ImpulseFormOptionalOutputVerbose<TEnabled, TElement> =>
      this._toVerbose(monitor, ({ _outputVerbose }) => _outputVerbose),
  )

  // V A L I D

  public readonly _valid = Impulse(
    (monitor): ImpulseFormOptionalFlag<TEnabled, TElement> =>
      this._toConcise<boolean>(
        monitor,
        ({ _valid }) => _valid,
        isBoolean,
      ) as ImpulseFormOptionalFlag<TEnabled, TElement>,
  )

  public readonly _validVerbose = Impulse(
    (monitor): ImpulseFormOptionalFlagVerbose<TEnabled, TElement> =>
      this._toVerbose(
        monitor,
        ({ _validVerbose }) => _validVerbose,
      ) as ImpulseFormOptionalFlagVerbose<TEnabled, TElement>,
  )

  // I N V A L I D

  public readonly _invalid = Impulse(
    (monitor): ImpulseFormOptionalFlag<TEnabled, TElement> =>
      this._toConcise<boolean>(
        monitor,
        ({ _invalid }) => _invalid,
        isBoolean,
      ) as ImpulseFormOptionalFlag<TEnabled, TElement>,
  )

  public readonly _invalidVerbose = Impulse(
    (monitor): ImpulseFormOptionalFlagVerbose<TEnabled, TElement> =>
      this._toVerbose(
        monitor,
        ({ _invalidVerbose }) => _invalidVerbose,
      ) as ImpulseFormOptionalFlagVerbose<TEnabled, TElement>,
  )

  // V A L I D A T E D

  public readonly _validated = Impulse(
    (monitor): ImpulseFormOptionalFlag<TEnabled, TElement> =>
      this._toConcise<boolean>(
        monitor,
        ({ _validated }) => _validated,
        isBoolean,
      ) as ImpulseFormOptionalFlag<TEnabled, TElement>,
  )

  public readonly _validatedVerbose = Impulse(
    (monitor): ImpulseFormOptionalFlagVerbose<TEnabled, TElement> =>
      this._toVerbose(
        monitor,
        ({ _validatedVerbose }) => _validatedVerbose,
      ) as ImpulseFormOptionalFlagVerbose<TEnabled, TElement>,
  )

  public _forceValidated(monitor: Monitor): void {
    this._enabled._forceValidated(monitor)
    this._element._forceValidated(monitor)
  }

  // D I R T Y

  public readonly _dirty = Impulse(
    (monitor): ImpulseFormOptionalFlag<TEnabled, TElement> =>
      this._toConcise<boolean>(
        monitor,
        ({ _dirty }) => _dirty,
        isBoolean,
      ) as ImpulseFormOptionalFlag<TEnabled, TElement>,
  )

  public readonly _dirtyVerbose = Impulse(
    (monitor): ImpulseFormOptionalFlagVerbose<TEnabled, TElement> =>
      this._toVerbose(
        monitor,
        ({ _dirtyVerbose }) => _dirtyVerbose,
      ) as ImpulseFormOptionalFlagVerbose<TEnabled, TElement>,
  )

  public readonly _dirtyOn = Impulse(
    (monitor): ImpulseFormOptionalFlag<TEnabled, TElement> =>
      this._toConcise<boolean>(
        monitor,
        ({ _dirtyOn }) => _dirtyOn,
        isBoolean,
      ) as ImpulseFormOptionalFlag<TEnabled, TElement>,
  )

  public readonly _dirtyOnVerbose = Impulse(
    (monitor): ImpulseFormOptionalFlagVerbose<TEnabled, TElement> =>
      this._toVerbose(
        monitor,
        ({ _dirtyOnVerbose }) => _dirtyOnVerbose,
      ) as ImpulseFormOptionalFlagVerbose<TEnabled, TElement>,
  )

  // R E S E T

  public _reset(
    monitor: Monitor,
    resetter: undefined | ImpulseFormOptionalInputSetter<TEnabled, TElement>,
  ): void {
    if (!isUndefined(resetter)) {
      this._setInitial(monitor, resetter)
    }

    this._enabled._reset(monitor, undefined)
    this._element._reset(monitor, undefined)
  }

  // C H I L D R E N

  public _getChildren<TChildParams extends ImpulseFormParams>(
    monitor: Monitor,
  ): ReadonlyArray<ImpulseFormChild<TChildParams, ImpulseFormOptionalParams<TEnabled, TElement>>> {
    const enabledValue = this._enabled._output.read(monitor)

    const enabledChild: ImpulseFormChild<
      TChildParams,
      ImpulseFormOptionalParams<TEnabled, TElement>
    > = {
      _state: this._enabled as unknown as ImpulseFormState<TChildParams>,
      _mapToChild: () => enabledValue as unknown as TChildParams["output.schema"],
    }

    if (enabledValue !== true) {
      return [enabledChild]
    }

    return [
      enabledChild,
      {
        _state: this._element as unknown as ImpulseFormState<TChildParams>,
        _mapToChild: (output) => output,
      },
    ]
  }
}

export { ImpulseFormOptionalState }
