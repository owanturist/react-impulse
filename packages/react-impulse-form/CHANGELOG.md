# react-impulse-form

## 0.2.0

### Minor Changes

- [#661](https://github.com/owanturist/react-impulse/pull/661) [`01f1f56`](https://github.com/owanturist/react-impulse/commit/01f1f562b759844632d6d7fbd22b0dfb1555470e) Thanks [@owanturist](https://github.com/owanturist)! - Introduce:

  - ```ts
    abstract class ImpulseForm {
      isSubmitting(scope: Scope): boolean;

      getSubmitCount(scope: Scope): number;

      onSubmit(
        listener: (value: TParams["value.schema"]) => void | Promise<unknown>,
      ): VoidFunction;

      submit(): Promise<void>;

      focusFirstInvalidValue(): void;

      isValidated(scope: Scope): boolean;
      isValidated<TResult>(
        scope: Scope,
        select: (
          concise: TParams["flag.schema"],
          verbose: TParams["flag.schema.verbose"],
        ) => TResult,
      ): TResult;

      getValidateOn(scope: Scope): TParams["validateOn.schema"];
      getValidateOn<TResult>(
        scope: Scope,
        select: (
          concise: TParams["validateOn.schema"],
          verbose: TParams["validateOn.schema.verbose"],
        ) => TResult,
      ): TResult;

      setValidateOn(setter: TParams["validateOn.setter"]): void;
    }
    ```

  - `ImpulseFormShapeOptions.validateOn`
  - `ImpulseFormValueOptions.validateOn`
  - ```ts
    class ImpulseFormValue {
      onFocusWhenInvalid(
        onFocus: (errors: ReadonlyArray<string>) => void,
      ): VoidFunction;
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
