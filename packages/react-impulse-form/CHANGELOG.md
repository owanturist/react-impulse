# react-impulse-form

## 0.4.0

### Minor Changes

- [#695](https://github.com/owanturist/react-impulse/pull/695) [`33e677d`](https://github.com/owanturist/react-impulse/commit/33e677dfe94e06fcf10cd04f5e0afe9facbbe5bb) Thanks [@owanturist](https://github.com/owanturist)! - 1. `ImpulseForm#setInitialValue` receives two parameters in the callback:
  - initial value
  - current (original) value
  1. `ImpulseForm#setOriginalValue` receives two parameters in the callback:
     - current (original) value
     - initial value
  1. `ImpulseFormList#reset` and `ImpulseFormList#isDirty` work correctly for removed/added items (Resolves #694)

### Patch Changes

- [#739](https://github.com/owanturist/react-impulse/pull/739) [`aef4d6d`](https://github.com/owanturist/react-impulse/commit/aef4d6d805c0513c11a6fd989f9d878dea57e1bd) Thanks [@owanturist](https://github.com/owanturist)! - Update dependencies. Replace `remeda` by custom functions.

- Updated dependencies [[`aef4d6d`](https://github.com/owanturist/react-impulse/commit/aef4d6d805c0513c11a6fd989f9d878dea57e1bd)]:
  - react-impulse@2.0.3

## 0.3.2

### Patch Changes

- [#682](https://github.com/owanturist/react-impulse/pull/682) [`7cb0620`](https://github.com/owanturist/react-impulse/commit/7cb0620dc120a96b4edf2382526feabf3eb31bd4) Thanks [@owanturist](https://github.com/owanturist)! - `ImpulseForm#isInvalid` does not check for `isValidated` anymore.

## 0.3.1

### Patch Changes

- [#676](https://github.com/owanturist/react-impulse/pull/676) [`98641bd`](https://github.com/owanturist/react-impulse/commit/98641bd199babca7ab0c7c80720ab9e913c7967a) Thanks [@owanturist](https://github.com/owanturist)! - Fixes:

  - `ImpulseForm#isValid` returns true only when `ImpulseForm#isValidated` is true.
  - `ImpulseFormValue#reset` sets `ImpulseFormValue#isTouched` to false.

## 0.3.0

### Minor Changes

- [#671](https://github.com/owanturist/react-impulse/pull/671) [`9cf128c`](https://github.com/owanturist/react-impulse/commit/9cf128c769ac99c14cf4f14dd2abb50a2f632ce3) Thanks [@owanturist](https://github.com/owanturist)! - Breaking change:

  - Rename `ImpulseFormValueOptions.compare` to `ImpulseFormValueOptions.isOriginalValueEqual`
  - `ImpulseFormValue#setOriginalValue` does not reset errors on call anymore. Call `ImpulseFormValue#setErrors([])` manually when needed.

- [#674](https://github.com/owanturist/react-impulse/pull/674) [`8f7d9e2`](https://github.com/owanturist/react-impulse/commit/8f7d9e2f3787bf3f7ff1fe49d9ae7711862210f0) Thanks [@owanturist](https://github.com/owanturist)! - Breaking changes:

  - `ImpulseFormShape#isValidated`, `ImpulseFormShape#isDirty`, and `ImpulseFormShape#isTouched` return `false` for empty shapes.

  Introduced:

  - `ImpulseFormList` class.

## 0.2.0

### Minor Changes

- [#661](https://github.com/owanturist/react-impulse/pull/661) [`01f1f56`](https://github.com/owanturist/react-impulse/commit/01f1f562b759844632d6d7fbd22b0dfb1555470e) Thanks [@owanturist](https://github.com/owanturist)! - Introduce:

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

  Breaking changes:

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

## 0.1.2

### Patch Changes

- [#653](https://github.com/owanturist/react-impulse/pull/653) [`04d25d2`](https://github.com/owanturist/react-impulse/commit/04d25d202370407d39aaa98148e1bfb3b3c5ce20) Thanks [@owanturist](https://github.com/owanturist)! - Reset isSubmitting when submit is done

## 0.1.1

### Patch Changes

- [`cb0b7ce`](https://github.com/owanturist/react-impulse/commit/cb0b7ce8411133083bb231933c0adf17bdc2eebd) Thanks [@owanturist](https://github.com/owanturist)! - Reduce file size by marking private, protected and internal methods/fields with `_` prefix, so they are mangled during build.

## 0.1.0

### Minor Changes

- [#632](https://github.com/owanturist/react-impulse/pull/632) [`ed5dd40`](https://github.com/owanturist/react-impulse/commit/ed5dd40fd887546c30b783cf627e63e315bcf5b1) Thanks [@owanturist](https://github.com/owanturist)! - Initial release 🎉
