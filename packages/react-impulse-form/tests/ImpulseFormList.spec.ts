import type { Scope } from "react-impulse"
import { z } from "zod"

import {
  type ValidateStrategy,
  type Setter,
  ImpulseFormList,
  ImpulseFormValue,
} from "../src"

describe("ImpulseFormList#getErrors()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([ImpulseFormValue.of(0)])

    expectTypeOf(form.getErrors).toEqualTypeOf<{
      (scope: Scope): null | ReadonlyArray<null | ReadonlyArray<string>>

      <TResult>(
        scope: Scope,
        select: (
          concise: null | ReadonlyArray<null | ReadonlyArray<string>>,
          verbose: ReadonlyArray<null | ReadonlyArray<string>>,
        ) => TResult,
      ): TResult
    }>()

    expectTypeOf(form.getElements(scope).at(0)!.getErrors).toEqualTypeOf<{
      (scope: Scope): null | ReadonlyArray<string>

      <TResult>(
        scope: Scope,
        select: (
          concise: null | ReadonlyArray<string>,
          verbose: null | ReadonlyArray<string>,
        ) => TResult,
      ): TResult
    }>()
  })
})

describe("ImpulseFormList#setErrors()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([ImpulseFormValue.of(0)])

    expectTypeOf(form.setErrors).toEqualTypeOf<
      (
        setter: Setter<
          null | ReadonlyArray<
            undefined | Setter<null | ReadonlyArray<string>>
          >,
          [ReadonlyArray<null | ReadonlyArray<string>>]
        >,
      ) => void
    >()

    expectTypeOf(form.getElements(scope).at(0)!.setErrors).toEqualTypeOf<
      (setter: Setter<null | ReadonlyArray<string>>) => void
    >()
  })
})

describe("ImpulseFormList#isValidated()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([ImpulseFormValue.of(0)])

    expectTypeOf(form.isValidated).toEqualTypeOf<{
      (scope: Scope): boolean

      <TResult>(
        scope: Scope,
        select: (
          concise: boolean | ReadonlyArray<boolean>,
          verbose: ReadonlyArray<boolean>,
        ) => TResult,
      ): TResult
    }>()

    expectTypeOf(form.getElements(scope).at(0)!.isValidated).toEqualTypeOf<{
      (scope: Scope): boolean

      <TResult>(
        scope: Scope,
        select: (concise: boolean, verbose: boolean) => TResult,
      ): TResult
    }>()
  })
})

describe("ImpulseFormList#getValidateOn()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([ImpulseFormValue.of(0)])

    expectTypeOf(form.getValidateOn).toEqualTypeOf<{
      (scope: Scope): ValidateStrategy | ReadonlyArray<ValidateStrategy>

      <TResult>(
        scope: Scope,
        select: (
          concise: ValidateStrategy | ReadonlyArray<ValidateStrategy>,
          verbose: ReadonlyArray<ValidateStrategy>,
        ) => TResult,
      ): TResult
    }>()

    expectTypeOf(form.getElements(scope).at(0)!.getValidateOn).toEqualTypeOf<{
      (scope: Scope): ValidateStrategy

      <TResult>(
        scope: Scope,
        select: (
          concise: ValidateStrategy,
          verbose: ValidateStrategy,
        ) => TResult,
      ): TResult
    }>()
  })
})

describe("ImpulseFormList#setValidateOn()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([ImpulseFormValue.of(0)])

    expectTypeOf(form.setValidateOn).toEqualTypeOf<
      (
        setter: Setter<
          | ValidateStrategy
          | ReadonlyArray<undefined | Setter<ValidateStrategy>>,
          [ReadonlyArray<ValidateStrategy>]
        >,
      ) => void
    >()

    expectTypeOf(form.getElements(scope).at(0)!.setValidateOn).toEqualTypeOf<
      (setter: Setter<ValidateStrategy>) => void
    >()
  })
})

describe("ImpulseFormList#isTouched()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([ImpulseFormValue.of(0)])

    expectTypeOf(form.isTouched).toEqualTypeOf<{
      (scope: Scope): boolean

      <TResult>(
        scope: Scope,
        select: (
          concise: boolean | ReadonlyArray<boolean>,
          verbose: ReadonlyArray<boolean>,
        ) => TResult,
      ): TResult
    }>()

    expectTypeOf(form.getElements(scope).at(0)!.isTouched).toEqualTypeOf<{
      (scope: Scope): boolean

      <TResult>(
        scope: Scope,
        select: (concise: boolean, verbose: boolean) => TResult,
      ): TResult
    }>()
  })
})

describe("ImpulseFormList#setTouched()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([ImpulseFormValue.of(0)])

    expectTypeOf(form.setTouched).toEqualTypeOf<
      (
        setter: Setter<
          boolean | ReadonlyArray<undefined | Setter<boolean>>,
          [ReadonlyArray<boolean>]
        >,
      ) => void
    >()

    expectTypeOf(form.getElements(scope).at(0)!.setTouched).toEqualTypeOf<
      (setter: Setter<boolean>) => void
    >()
  })
})

describe("ImpulseFormList#reset()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0, {
        schema: z.number().transform((x) => x.toFixed()),
      }),
    ])

    expectTypeOf(form.reset).toEqualTypeOf<
      (
        resetter?: Setter<
          ReadonlyArray<undefined | Setter<number, [number, number]>>,
          [ReadonlyArray<number>, ReadonlyArray<number>]
        >,
      ) => void
    >()

    expectTypeOf(form.getElements(scope).at(0)!.reset).toEqualTypeOf<
      (resetter?: Setter<number, [number, number]>) => void
    >()
  })
})

describe("ImpulseFormList#isDirty()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([ImpulseFormValue.of(0)])

    expectTypeOf(form.isDirty).toEqualTypeOf<{
      (scope: Scope): boolean

      <TResult>(
        scope: Scope,
        select: (
          concise: boolean | ReadonlyArray<boolean>,
          verbose: ReadonlyArray<boolean>,
        ) => TResult,
      ): TResult
    }>()

    expectTypeOf(form.getElements(scope).at(0)!.isDirty).toEqualTypeOf<{
      (scope: Scope): boolean

      <TResult>(
        scope: Scope,
        select: (concise: boolean, verbose: boolean) => TResult,
      ): TResult
    }>()
  })
})

describe("ImpulseFormList#getValue()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0, {
        schema: z.number().transform((x) => x.toFixed()),
      }),
    ])

    expectTypeOf(form.getValue).toEqualTypeOf<{
      (scope: Scope): null | ReadonlyArray<string>

      <TResult>(
        scope: Scope,
        select: (
          concise: null | ReadonlyArray<string>,
          verbose: ReadonlyArray<null | string>,
        ) => TResult,
      ): TResult
    }>()

    expectTypeOf(form.getElements(scope).at(0)!.getValue).toEqualTypeOf<{
      (scope: Scope): null | string

      <TResult>(
        scope: Scope,
        select: (concise: null | string, verbose: null | string) => TResult,
      ): TResult
    }>()
  })
})

describe("ImpulseFormList#getOriginalValue()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0, {
        schema: z.number().transform((x) => x.toFixed()),
      }),
    ])

    expectTypeOf(form.getOriginalValue).toEqualTypeOf<
      (scope: Scope) => ReadonlyArray<number>
    >()

    expectTypeOf(form.getElements(scope).at(0)!.getOriginalValue).toEqualTypeOf<
      (scope: Scope) => number
    >()
  })
})

describe("ImpulseFormList#setOriginalValue()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([ImpulseFormValue.of(0)])

    expectTypeOf(form.setOriginalValue).toEqualTypeOf<
      (
        setter: Setter<
          ReadonlyArray<undefined | Setter<number>>,
          [ReadonlyArray<number>]
        >,
      ) => void
    >()

    expectTypeOf(form.getElements(scope).at(0)!.setOriginalValue).toEqualTypeOf<
      (setter: Setter<number>) => void
    >()
  })
})

describe("ImpulseFormList#getInitialValue()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0, {
        schema: z.number().transform((x) => x.toFixed()),
      }),
    ])

    expectTypeOf(form.getInitialValue).toEqualTypeOf<
      (scope: Scope) => ReadonlyArray<number>
    >()

    expectTypeOf(form.getElements(scope).at(0)!.getInitialValue).toEqualTypeOf<
      (scope: Scope) => number
    >()
  })
})

describe("ImpulseFormList#setInitialValue()", () => {
  it("matches the type definition", ({ scope }) => {
    const form = ImpulseFormList.of([ImpulseFormValue.of(0)])

    expectTypeOf(form.setInitialValue).toEqualTypeOf<
      (
        setter: Setter<
          ReadonlyArray<undefined | Setter<number>>,
          [ReadonlyArray<number>]
        >,
      ) => void
    >()

    expectTypeOf(form.getElements(scope).at(0)!.setInitialValue).toEqualTypeOf<
      (setter: Setter<number>) => void
    >()
  })
})
