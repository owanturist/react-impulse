---
"react-impulse-form": minor
---

Introduce:

- ```ts
  abstract class ImpulseForm {
    isSubmitting(scope: Scope): boolean

    getSubmitCount(scope: Scope): number

    onSubmit(
      listener: (value: TParams["value.schema"]) => void | Promise<unknown>,
    ): VoidFunction

    submit(): Promise<void>

    focusFirstInvalidValue(): void

    isValidated(scope: Scope): boolean
    isValidated<TResult>(
      scope: Scope,
      select: (
        concise: TParams["flag.schema"],
        verbose: TParams["flag.schema.verbose"],
      ) => TResult,
    ): TResult

    getValidateOn(scope: Scope): TParams["validateOn.schema"]
    getValidateOn<TResult>(
      scope: Scope,
      select: (
        concise: TParams["validateOn.schema"],
        verbose: TParams["validateOn.schema.verbose"],
      ) => TResult,
    ): TResult

    setValidateOn(setter: TParams["validateOn.setter"]): void
  }
  ```

- `ImpulseFormShapeOptions.validateOn`

- `ImpulseFormValueOptions.validateOn`

- ```ts
  class ImpulseFormValue {
    onFocusWhenInvalid(
      onFocus: (errors: ReadonlyArray<string>) => void,
    ): VoidFunction
  }
  ```

Extended:

- ```diff
  -ImpulseFormValue#setSchema(schema: Schema): void
  +ImpulseFormValue#setSchema(schema: Schema | null): void
  ```

Change:

- use `ImpulseForm#submit`, `ImpulseForm#getSubmitCount`, `ImpulseForm#isSubmitting` instead

  ```diff
  -interface UseImpulseFormResult {
  -  submit(this: void): void
  -  getSubmitCount(this: void, scope: Scope): number
  -  isSubmitting(this: void, scope: Scope): boolean
  -}

  const useImpulseForm = <TForm extends ImpulseForm>(
    form: TForm,
    options?: UseImpulseFormOptions<TForm>,
  -): UseImpulseFormResult
  +): void
  ```

- use `ImpulseForm#submit`, `ImpulseForm#getSubmitCount`, `ImpulseForm#isSubmitting` instead

  ```diff
  interface UseImpulseFormValueOptions<TForm extends ImpulseForm> extends UseImpulseFormOptions<TForm> {
    /**
    * @default true
    */
    shouldFocusWhenInvalid?: boolean
    onFocusInvalid?:
  +   | null
  +   | undefined
  +   | HTMLElement
      | RefObject<null | undefined | HTMLElement>
      | Func<[errors: ReadonlyArray<string>, form: TForm]>
  }

  const useImpulseFormValue = <TOriginalValue, TValue = TOriginalValue>(
    form: ImpulseFormValue<TOriginalValue, TValue>,
    options?: UseImpulseFormValueOptions<typeof form>,
  -): UseImpulseFormValueResult
  +): void
  ```
