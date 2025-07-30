import { forEntries } from "~/tools/for-entries"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isTrue } from "~/tools/is-true"
import { isTruthy } from "~/tools/is-truthy"
import { isUndefined } from "~/tools/is-undefined"
import { mapValues } from "~/tools/map-values"
import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import { type Impulse, type Scope, batch } from "../dependencies"
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
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export class ImpulseFormSwitch<
  TBranches extends ImpulseFormSwitchBranches = ImpulseFormSwitchBranches,
> extends ImpulseForm<ImpulseFormSwitchParams<TBranches>> {
  public readonly branches: Readonly<TBranches>

  public constructor(
    root: null | ImpulseForm,
    private readonly active: Impulse<keyof TBranches>,
    branches: TBranches,
  ) {
    super(root)

    this.branches = mapValues(branches, (child) =>
      ImpulseForm._childOf(this, child),
    )
  }

  protected override _submitWith(
    output: ImpulseFormSwitchOutput<TBranches>,
  ): ReadonlyArray<void | Promise<unknown>> {}

  protected override _getFocusFirstInvalid(scope: Scope): VoidFunction | null {}

  protected _childOf(
    parent: null | ImpulseForm,
  ): ImpulseFormSwitch<TBranches> {}

  protected _setInitial(
    initial: undefined | ImpulseFormSwitch<TBranches>,
    isRoot: boolean,
  ): void {}

  protected _setValidated(isValidated: boolean): void {}

  protected _isDirty<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TBranches>,
      verbose: ImpulseFormSwitchFlagVerbose<TBranches>,
      dirty: ImpulseFormSwitchFlagVerbose<TBranches>,
    ) => TResult,
  ): TResult {}

  public getActive(scope: Scope): keyof TBranches {
    return this.active.getValue(scope)
  }

  public setActive(active: Setter<keyof TBranches>): void {
    this.active.setValue(active)
  }

  public getError(scope: Scope): ImpulseFormSwitchError<TBranches>
  public getError<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchError<TBranches>,
      verbose: ImpulseFormSwitchErrorVerbose<TBranches>,
    ) => TResult,
  ): TResult
  public getError<TResult = ImpulseFormSwitchError<TBranches>>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchError<TBranches>,
      verbose: ImpulseFormSwitchErrorVerbose<TBranches>,
    ) => TResult = params._first as typeof select,
  ): TResult {}

  public setError(setter: ImpulseFormSwitchErrorSetter<TBranches>): void {}

  public isValidated(scope: Scope): boolean

  public isValidated<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TBranches>,
      verbose: ImpulseFormSwitchFlagVerbose<TBranches>,
    ) => TResult,
  ): TResult
  public isValidated<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TBranches>,
      verbose: ImpulseFormSwitchFlagVerbose<TBranches>,
    ) => TResult = isTrue as unknown as typeof select,
  ): TResult {}

  public getValidateOn(scope: Scope): ImpulseFormSwitchValidateOn<TBranches>
  public getValidateOn<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchValidateOn<TBranches>,
      verbose: ImpulseFormSwitchValidateOnVerbose<TBranches>,
    ) => TResult,
  ): TResult
  public getValidateOn<TResult = ImpulseFormSwitchValidateOn<TBranches>>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchValidateOn<TBranches>,
      verbose: ImpulseFormSwitchValidateOnVerbose<TBranches>,
    ) => TResult = params._first as typeof select,
  ): TResult {}

  public setValidateOn(
    validateOn: ImpulseFormSwitchValidateOnSetter<TBranches>,
  ): void {}

  public isTouched(scope: Scope): boolean
  public isTouched<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TBranches>,
      verbose: ImpulseFormSwitchFlagVerbose<TBranches>,
    ) => TResult,
  ): TResult
  public isTouched<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TBranches>,
      verbose: ImpulseFormSwitchFlagVerbose<TBranches>,
    ) => TResult = isTruthy as unknown as typeof select,
  ): TResult {}

  public setTouched(touched: ImpulseFormSwitchFlagSetter<TBranches>): void {}

  public reset(
    resetter: ImpulseFormSwitchInputSetter<TBranches> = params._first as typeof resetter,
  ): void {}

  public getOutput(scope: Scope): null | ImpulseFormSwitchOutput<TBranches>
  public getOutput<TResult>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormSwitchOutput<TBranches>,
      verbose: ImpulseFormSwitchOutputVerbose<TBranches>,
    ) => TResult,
  ): TResult
  public getOutput<TResult = null | ImpulseFormSwitchOutput<TBranches>>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormSwitchOutput<TBranches>,
      verbose: ImpulseFormSwitchOutputVerbose<TBranches>,
    ) => TResult = params._first as typeof select,
  ): TResult {
    const kind = this.getActive(scope)
    const [conciseOutput, verboseOutput] = this.branches[kind].getOutput(
      scope,
      params,
    )

    const concise = isNull(conciseOutput)
      ? null
      : { kind, value: conciseOutput }

    const verbose = { kind, value: verboseOutput }

    return select(
      concise as null | ImpulseFormSwitchOutput<TBranches>,
      verbose as ImpulseFormSwitchOutputVerbose<TBranches>,
    )
  }

  public getInput(scope: Scope): ImpulseFormSwitchInput<TBranches> {
    const input = mapValues(this.branches, (branch) => branch.getInput(scope))

    return input as ImpulseFormSwitchInput<TBranches>
  }

  public setInput(setter: ImpulseFormSwitchInputSetter<TBranches>): void {
    batch((scope) => {
      const input = isFunction(setter)
        ? setter(this.getInput(scope), this.getInitial(scope))
        : setter

      forEntries(this.branches, (branch, kind) => {
        const branchInput = input[kind]

        if (!isUndefined(branchInput)) {
          branch.setInput(branchInput)
        }
      })
    })
  }

  public getInitial(scope: Scope): ImpulseFormSwitchInput<TBranches> {
    const initial = mapValues(this.branches, (branch) =>
      branch.getInitial(scope),
    )

    return initial as ImpulseFormSwitchInput<TBranches>
  }

  public setInitial(setter: ImpulseFormSwitchInputSetter<TBranches>): void {
    batch((scope) => {
      const initial = isFunction(setter)
        ? setter(this.getInitial(scope), this.getInput(scope))
        : setter

      forEntries(this.branches, (branch, kind) => {
        const branchInitial = initial[kind]

        if (!isUndefined(branchInitial)) {
          branch.setInitial(branchInitial)
        }
      })
    })
  }
}
