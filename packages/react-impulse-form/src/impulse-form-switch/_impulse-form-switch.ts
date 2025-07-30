import { isTrue } from "~/tools/is-true"
import { isTruthy } from "~/tools/is-truthy"
import { params } from "~/tools/params"

import type { Scope } from "../dependencies"
import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormSwitchError } from "./_impulse-form-switch-error"
import type { ImpulseFormSwitchErrorSetter } from "./_impulse-form-switch-error-setter"
import type { ImpulseFormSwitchErrorVerbose } from "./_impulse-form-switch-error-verbose"
import type { ImpulseFormSwitchFlag } from "./_impulse-form-switch-flag"
import type { ImpulseFormSwitchFlagSetter } from "./_impulse-form-switch-flag-setter"
import type { ImpulseFormSwitchFlagVerbose } from "./_impulse-form-switch-flag-verbose"
import type { ImpulseFormSwitchInput } from "./_impulse-form-switch-input"
import type { ImpulseFormSwitchInputSetter } from "./_impulse-form-switch-input-setter"
import type { ImpulseFormSwitchOutput } from "./_impulse-form-switch-output"
import type { ImpulseFormSwitchOutputVerbose } from "./_impulse-form-switch-output-verbose"
import type { ImpulseFormSwitchParams } from "./_impulse-form-switch-params"
import type { ImpulseFormSwitchValidateOn } from "./_impulse-form-switch-validate-on"
import type { ImpulseFormSwitchValidateOnSetter } from "./_impulse-form-switch-validate-on-setter"
import type { ImpulseFormSwitchValidateOnVerbose } from "./_impulse-form-switch-validate-on-verbose"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export class ImpulseFormSwitch<
  TCases extends ImpulseFormSwitchCases = ImpulseFormSwitchCases,
> extends ImpulseForm<ImpulseFormSwitchParams<TCases>> {
  public constructor(root: null | ImpulseForm, cases: TCases) {
    super(root)
  }

  protected override _submitWith(
    output: ImpulseFormSwitchOutput<TCases>,
  ): ReadonlyArray<void | Promise<unknown>> {}

  protected override _getFocusFirstInvalid(scope: Scope): VoidFunction | null {}

  protected _childOf(parent: null | ImpulseForm): ImpulseFormSwitch<TCases> {}

  protected _setInitial(
    initial: undefined | ImpulseFormSwitch<TCases>,
    isRoot: boolean,
  ): void {}

  protected _setValidated(isValidated: boolean): void {}

  protected _isDirty<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TCases>,
      verbose: ImpulseFormSwitchFlagVerbose<TCases>,
      dirty: ImpulseFormSwitchFlagVerbose<TCases>,
    ) => TResult,
  ): TResult {}

  public getError(scope: Scope): ImpulseFormSwitchError<TCases>
  public getError<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchError<TCases>,
      verbose: ImpulseFormSwitchErrorVerbose<TCases>,
    ) => TResult,
  ): TResult
  public getError<TResult = ImpulseFormSwitchError<TCases>>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchError<TCases>,
      verbose: ImpulseFormSwitchErrorVerbose<TCases>,
    ) => TResult = params._first as typeof select,
  ): TResult {}

  public setError(setter: ImpulseFormSwitchErrorSetter<TCases>): void {}
  public isValidated(scope: Scope): boolean

  public isValidated<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TCases>,
      verbose: ImpulseFormSwitchFlagVerbose<TCases>,
    ) => TResult,
  ): TResult
  public isValidated<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TCases>,
      verbose: ImpulseFormSwitchFlagVerbose<TCases>,
    ) => TResult = isTrue as unknown as typeof select,
  ): TResult {}

  public getValidateOn(scope: Scope): ImpulseFormSwitchValidateOn<TCases>
  public getValidateOn<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchValidateOn<TCases>,
      verbose: ImpulseFormSwitchValidateOnVerbose<TCases>,
    ) => TResult,
  ): TResult
  public getValidateOn<TResult = ImpulseFormSwitchValidateOn<TCases>>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchValidateOn<TCases>,
      verbose: ImpulseFormSwitchValidateOnVerbose<TCases>,
    ) => TResult = params._first as typeof select,
  ): TResult {}

  public setValidateOn(
    validateOn: ImpulseFormSwitchValidateOnSetter<TCases>,
  ): void {}

  public isTouched(scope: Scope): boolean
  public isTouched<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TCases>,
      verbose: ImpulseFormSwitchFlagVerbose<TCases>,
    ) => TResult,
  ): TResult
  public isTouched<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TCases>,
      verbose: ImpulseFormSwitchFlagVerbose<TCases>,
    ) => TResult = isTruthy as unknown as typeof select,
  ): TResult {}

  public setTouched(touched: ImpulseFormSwitchFlagSetter<TCases>): void {}

  public reset(
    resetter: ImpulseFormSwitchInputSetter<TCases> = params._first as typeof resetter,
  ): void {}

  public getOutput(scope: Scope): null | ImpulseFormSwitchOutput<TCases>
  public getOutput<TResult>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormSwitchOutput<TCases>,
      verbose: ImpulseFormSwitchOutputVerbose<TCases>,
    ) => TResult,
  ): TResult
  public getOutput<TResult = null | ImpulseFormSwitchOutput<TCases>>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormSwitchOutput<TCases>,
      verbose: ImpulseFormSwitchOutputVerbose<TCases>,
    ) => TResult = params._first as typeof select,
  ): TResult {}

  public getInput(scope: Scope): ImpulseFormSwitchInput<TCases> {}

  public setInput(setter: ImpulseFormSwitchInputSetter<TCases>): void {}

  public getInitial(scope: Scope): ImpulseFormSwitchInput<TCases> {}

  public setInitial(setter: ImpulseFormSwitchInputSetter<TCases>): void {}
}
