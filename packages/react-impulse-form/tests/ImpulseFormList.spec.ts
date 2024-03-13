import type { Scope } from "react-impulse"
import { z } from "zod"

import {
  type ValidateStrategy,
  type Setter,
  type ImpulseFormValueOptions,
  type ImpulseFormListOptions,
  ImpulseFormList,
  ImpulseFormValue,
} from "../src"

import { arg } from "./common"

describe("ImpulseFormList#getErrors()", () => {
  const setup = (elements: ReadonlyArray<ImpulseFormValue<number>>) => {
    return ImpulseFormList.of(elements)
  }

  const setupElement = (
    initial: number,
    options?: ImpulseFormValueOptions<number>,
  ) => {
    return ImpulseFormValue.of(initial, options)
  }

  it("matches the type definition", ({ scope }) => {
    const form = setup([setupElement(0)])

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

  it("returns null for empty list", ({ scope }) => {
    const form = setup([])

    expect(form.getErrors(scope)).toBeNull()
    expect(form.getErrors(scope, arg(0))).toBeNull()
    expect(form.getErrors(scope, arg(1))).toStrictEqual([])
  })

  it("returns null when none of the elements have errors", ({ scope }) => {
    const form = setup([setupElement(0), setupElement(1), setupElement(2)])

    expect(form.getErrors(scope)).toBeNull()
    expect(form.getErrors(scope, arg(0))).toBeNull()
    expect(form.getErrors(scope, arg(1))).toStrictEqual([null, null, null])
  })

  it("returns concise when at least one element has errors", ({ scope }) => {
    const form = setup([
      setupElement(0),
      setupElement(1),
      setupElement(2, { errors: ["err"] }),
    ])

    const expected = [null, null, ["err"]]

    expect(form.getErrors(scope)).toStrictEqual(expected)
    expect(form.getErrors(scope, arg(0))).toStrictEqual(expected)
    expect(form.getErrors(scope, arg(1))).toStrictEqual(expected)
  })

  it("returns concise when all elements have errors", ({ scope }) => {
    const form = setup([
      setupElement(0, { errors: ["err0"] }),
      setupElement(1, { errors: ["err1"] }),
      setupElement(2, { errors: ["err2"] }),
    ])

    const expected = [["err0"], ["err1"], ["err2"]]

    expect(form.getErrors(scope)).toStrictEqual(expected)
    expect(form.getErrors(scope, arg(0))).toStrictEqual(expected)
    expect(form.getErrors(scope, arg(1))).toStrictEqual(expected)
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

  it("resets all errors with null", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0, { errors: ["err0"] }),
      ImpulseFormValue.of(1, { errors: ["err1"] }),
      ImpulseFormValue.of(2, { errors: ["err2"] }),
    ])

    form.setErrors(null)
    expect(form.getErrors(scope)).toBeNull()
  })

  it("changes all errors", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0, { errors: ["err0"] }),
      ImpulseFormValue.of(1, { errors: ["err1"] }),
      ImpulseFormValue.of(2, { errors: ["err2"] }),
    ])

    form.setErrors([["e0"], ["e1"], []])
    expect(form.getErrors(scope)).toStrictEqual([["e0"], ["e1"], null])
  })

  it("changes some errors", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0, { errors: ["err0"] }),
      ImpulseFormValue.of(1, { errors: ["err1"] }),
      ImpulseFormValue.of(2, { errors: ["err2"] }),
    ])

    form.setErrors([(x) => [...x!, "x"], undefined, (x) => [...x!, "x"]])
    expect(form.getErrors(scope)).toStrictEqual([
      ["err0", "x"],
      ["err1"],
      ["err2", "x"],
    ])
  })
})

describe("ImpulseFormList#isValidated()", () => {
  const setup = (elements: ReadonlyArray<ImpulseFormValue<number>>) => {
    return ImpulseFormList.of(elements)
  }

  const setupElement = (
    initial: number,
    options?: ImpulseFormValueOptions<number>,
  ) => {
    return ImpulseFormValue.of(initial, options)
  }

  it("matches the type definition", ({ scope }) => {
    const form = setup([setupElement(0)])

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

  it("returns false for empty list", ({ scope }) => {
    const form = setup([])

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, arg(0))).toBe(false)
    expect(form.isValidated(scope, arg(1))).toStrictEqual([])
  })

  it("returns false when all elements are not validated", ({ scope }) => {
    const form = setup([setupElement(0), setupElement(1), setupElement(2)])

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, arg(0))).toBe(false)
    expect(form.isValidated(scope, arg(1))).toStrictEqual([false, false, false])
  })

  it("returns false when at least one element is not validated", ({
    scope,
  }) => {
    const form = setup([
      setupElement(0, { validateOn: "onInit" }),
      setupElement(1, { validateOn: "onInit" }),
      setupElement(2),
    ])

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, arg(0))).toStrictEqual([true, true, false])
    expect(form.isValidated(scope, arg(1))).toStrictEqual([true, true, false])
  })

  it("returns true when all elements are validated", ({ scope }) => {
    const form = setup([
      setupElement(0, { validateOn: "onInit" }),
      setupElement(1, { validateOn: "onInit" }),
      setupElement(2, { validateOn: "onInit" }),
    ])

    expect(form.isValidated(scope)).toBe(true)
    expect(form.isValidated(scope, arg(0))).toBe(true)
    expect(form.isValidated(scope, arg(1))).toStrictEqual([true, true, true])
  })

  it("returns false when at least one element has custom errors", ({
    scope,
  }) => {
    const form = setup([
      setupElement(0, { errors: ["error"] }),
      setupElement(1),
      setupElement(2),
    ])

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, arg(0))).toStrictEqual([true, false, false])
    expect(form.isValidated(scope, arg(1))).toStrictEqual([true, false, false])
  })
})

describe("ImpulseFormList#getValidateOn()", () => {
  const setup = (
    elements: ReadonlyArray<ImpulseFormValue<number>>,
    options?: ImpulseFormListOptions<ImpulseFormValue<number>>,
  ) => {
    return ImpulseFormList.of(elements, options)
  }

  const setupElement = (
    initial: number,
    options?: ImpulseFormValueOptions<number>,
  ) => {
    return ImpulseFormValue.of(initial, options)
  }

  it("matches the type definition", ({ scope }) => {
    const form = setup([setupElement(0)])

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

  it("returns 'onTouch' for empty list", ({ scope }) => {
    const form = setup([])

    expect(form.getValidateOn(scope)).toBe("onTouch")
    expect(form.getValidateOn(scope, arg(0))).toBe("onTouch")
    expect(form.getValidateOn(scope, arg(1))).toStrictEqual([])
  })

  it("returns verbose when elements use more than a single strategy", ({
    scope,
  }) => {
    const form = setup([
      setupElement(0, { validateOn: "onInit" }),
      setupElement(1),
      setupElement(2, { validateOn: "onSubmit" }),
    ])

    const expected = ["onInit", "onTouch", "onSubmit"]

    expect(form.getValidateOn(scope)).toStrictEqual(expected)
    expect(form.getValidateOn(scope, arg(0))).toStrictEqual(expected)
    expect(form.getValidateOn(scope, arg(1))).toStrictEqual(expected)
  })

  it("returns concise when all elements use the same strategy", ({ scope }) => {
    const form = setup([
      setupElement(0, { validateOn: "onChange" }),
      setupElement(1, { validateOn: "onChange" }),
      setupElement(2, { validateOn: "onChange" }),
    ])

    expect(form.getValidateOn(scope)).toBe("onChange")
    expect(form.getValidateOn(scope, arg(0))).toBe("onChange")
    expect(form.getValidateOn(scope, arg(1))).toStrictEqual([
      "onChange",
      "onChange",
      "onChange",
    ])
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

  it("changes all items", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0),
      ImpulseFormValue.of(1),
      ImpulseFormValue.of(2),
    ])

    form.setValidateOn("onInit")
    expect(form.getValidateOn(scope)).toBe("onInit")

    form.setValidateOn("onSubmit")
    expect(form.getValidateOn(scope)).toBe("onSubmit")
  })
})

describe("ImpulseFormList#isTouched()", () => {
  const setup = (elements: ReadonlyArray<ImpulseFormValue<number>>) => {
    return ImpulseFormList.of(elements)
  }

  const setupElement = (
    initial: number,
    options?: ImpulseFormValueOptions<number>,
  ) => {
    return ImpulseFormValue.of(initial, options)
  }

  it("matches the type definition", ({ scope }) => {
    const form = setup([setupElement(0)])

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

  it("returns false for empty list", ({ scope }) => {
    const form = setup([])

    expect(form.isTouched(scope)).toBe(false)
    expect(form.isTouched(scope, arg(0))).toBe(false)
    expect(form.isTouched(scope, arg(1))).toStrictEqual([])
  })

  it("returns false when all elements are not touched", ({ scope }) => {
    const form = setup([setupElement(0), setupElement(1), setupElement(2)])

    expect(form.isTouched(scope)).toBe(false)
    expect(form.isTouched(scope, arg(0))).toBe(false)
    expect(form.isTouched(scope, arg(1))).toStrictEqual([false, false, false])
  })

  it("returns true when at least one element is touched", ({ scope }) => {
    const form = setup([
      setupElement(0),
      setupElement(1),
      setupElement(2, { touched: true }),
    ])

    expect(form.isTouched(scope)).toBe(true)
    expect(form.isTouched(scope, arg(0))).toStrictEqual([false, false, true])
    expect(form.isTouched(scope, arg(1))).toStrictEqual([false, false, true])
  })

  it("returns true when all elements are touched", ({ scope }) => {
    const form = setup([
      setupElement(0, { touched: true }),
      setupElement(1, { touched: true }),
      setupElement(2, { touched: true }),
    ])

    expect(form.isTouched(scope)).toBe(true)
    expect(form.isTouched(scope, arg(0))).toBe(true)
    expect(form.isTouched(scope, arg(1))).toStrictEqual([true, true, true])
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

  it("touches all items", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0),
      ImpulseFormValue.of(1),
      ImpulseFormValue.of(2),
    ])

    form.setTouched(true)
    expect(form.isTouched(scope)).toBe(true)

    form.setTouched(false)
    expect(form.isTouched(scope)).toBe(false)
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

  it("sets initial values for all items", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0, { initialValue: 1 }),
      ImpulseFormValue.of(1, { initialValue: 2 }),
      ImpulseFormValue.of(2, { initialValue: 3 }),
    ])

    form.reset()
    expect(form.getValue(scope)).toStrictEqual([1, 2, 3])
  })

  it("clears custom errors", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0, { errors: ["error"] }),
      ImpulseFormValue.of(1, { errors: ["error"] }),
      ImpulseFormValue.of(2, { errors: ["error"] }),
    ])

    form.reset()
    expect(form.getErrors(scope)).toBeNull()
  })

  it("resets isValidated state", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0),
      ImpulseFormValue.of(1),
      ImpulseFormValue.of(2),
    ])

    form.setTouched(true)

    expect(form.isValidated(scope)).toBe(true)
    form.reset()
    expect(form.isValidated(scope)).toBe(false)
  })

  it("provides the initial value to the element resetter 1st argument", ({
    scope,
  }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0, { initialValue: 1 }),
      ImpulseFormValue.of(1, { initialValue: 2 }),
      ImpulseFormValue.of(2, { initialValue: 3 }),
    ])

    form.reset((initial) => initial.map((x) => x + 1))
    expect(form.getValue(scope)).toStrictEqual([2, 3, 4])
  })

  it("provides the original value to the resetter 2nd argument", ({
    scope,
  }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0, { initialValue: 1 }),
      ImpulseFormValue.of(1, { initialValue: 2 }),
      ImpulseFormValue.of(2, { initialValue: 3 }),
    ])

    form.reset((_, original) => original.map((x) => x + 1))
    expect(form.getOriginalValue(scope)).toStrictEqual([1, 2, 3])
  })
})

describe("ImpulseFormList#isDirty()", () => {
  const setup = (elements: ReadonlyArray<ImpulseFormValue<number>>) => {
    return ImpulseFormList.of(elements)
  }

  const setupElement = (
    initial: number,
    options?: ImpulseFormValueOptions<number>,
  ) => {
    return ImpulseFormValue.of(initial, options)
  }

  it("matches the type definition", ({ scope }) => {
    const form = setup([setupElement(0)])

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

  it("returns false for empty list", ({ scope }) => {
    const form = setup([])

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([])
  })

  it("returns false when all elements are not dirty", ({ scope }) => {
    const form = setup([setupElement(0), setupElement(1), setupElement(2)])

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([false, false, false])
  })

  it("returns true when at least one element is dirty", ({ scope }) => {
    const form = setup([
      setupElement(0),
      setupElement(1),
      setupElement(2, { initialValue: 3 }),
    ])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toStrictEqual([false, false, true])
    expect(form.isDirty(scope, arg(1))).toStrictEqual([false, false, true])
  })

  it("returns true when all elements are dirty", ({ scope }) => {
    const form = setup([
      setupElement(0, { initialValue: 1 }),
      setupElement(1, { initialValue: 2 }),
      setupElement(2, { initialValue: 3 }),
    ])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toBe(true)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([true, true, true])
  })
})

describe("ImpulseFormList#getValue()", () => {
  const setup = (elements: ReadonlyArray<ImpulseFormValue<number, string>>) => {
    return ImpulseFormList.of(elements, {
      validateOn: "onInit",
    })
  }

  const setupElement = (initial: number) => {
    return ImpulseFormValue.of(initial, {
      schema: z
        .number()
        .min(1)
        .transform((x) => x.toFixed()),
    })
  }

  it("matches the type definition", ({ scope }) => {
    const form = setup([setupElement(0)])

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

  it("returns all items when valid", ({ scope }) => {
    const form = setup([setupElement(1), setupElement(2), setupElement(3)])

    expect(form.getValue(scope)).toStrictEqual(["1", "2", "3"])
    expect(form.getValue(scope, arg(0))).toStrictEqual(["1", "2", "3"])
    expect(form.getValue(scope, arg(1))).toStrictEqual(["1", "2", "3"])
  })

  it("returns empty array for empty list", ({ scope }) => {
    const form = setup([])

    expect(form.getValue(scope)).toStrictEqual([])
    expect(form.getValue(scope, arg(0))).toStrictEqual([])
    expect(form.getValue(scope, arg(1))).toStrictEqual([])
  })

  it("returns null if a single element is not valid", ({ scope }) => {
    const form = setup([setupElement(0)])

    expect(form.getValue(scope)).toBeNull()
    expect(form.getValue(scope, arg(0))).toBeNull()
    expect(form.getValue(scope, arg(1))).toStrictEqual([null])
  })

  it("returns null if at least one element is not valid", ({ scope }) => {
    const form = setup([setupElement(1), setupElement(0), setupElement(3)])

    expect(form.getValue(scope)).toBeNull()
    expect(form.getValue(scope, arg(0))).toBeNull()
    expect(form.getValue(scope, arg(1))).toStrictEqual(["1", null, "3"])
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

  it("returns empty array for empty list", ({ scope }) => {
    const form = ImpulseFormList.of([])

    expect(form.getOriginalValue(scope)).toStrictEqual([])
  })

  it("returns an array of original values", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0),
      ImpulseFormValue.of(1),
      ImpulseFormValue.of(2),
    ])

    expect(form.getOriginalValue(scope)).toStrictEqual([0, 1, 2])
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

  it("changes all items", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0),
      ImpulseFormValue.of(1),
      ImpulseFormValue.of(2),
    ])

    form.setOriginalValue([3, 4, 5])
    expect(form.getOriginalValue(scope)).toStrictEqual([3, 4, 5])
  })

  it("changes nothing when setting an empty list", ({ scope }) => {
    const form = ImpulseFormList.of([ImpulseFormValue.of(0)])

    form.setOriginalValue([])
    expect(form.getOriginalValue(scope)).toStrictEqual([0])
  })

  it("keeps the list empty", ({ scope }) => {
    const form = ImpulseFormList.of<ImpulseFormValue<number>>([])

    form.setOriginalValue([0, 1])
    expect(form.getOriginalValue(scope)).toStrictEqual([])
  })

  it("changes only defined items", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0),
      ImpulseFormValue.of(1),
      ImpulseFormValue.of(2),
    ])

    form.setOriginalValue([3])
    expect(form.getOriginalValue(scope)).toStrictEqual([3, 1, 2])

    form.setOriginalValue([undefined, undefined, 4])
    expect(form.getOriginalValue(scope)).toStrictEqual([3, 1, 4])
  })

  it("does not extend existing list", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0),
      ImpulseFormValue.of(1),
      ImpulseFormValue.of(2),
    ])

    form.setOriginalValue([3, 4, 5, 6])
    expect(form.getOriginalValue(scope)).toStrictEqual([3, 4, 5])
  })

  it("passes the list in the transform function", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0),
      ImpulseFormValue.of(1),
      ImpulseFormValue.of(2),
    ])

    form.setOriginalValue((elements) => elements.map((x) => x + 1))
    expect(form.getOriginalValue(scope)).toStrictEqual([1, 2, 3])
  })

  it("passes an element in the transform function", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0),
      ImpulseFormValue.of(1),
      ImpulseFormValue.of(2),
    ])

    form.setOriginalValue([undefined, (x) => x + 3])
    expect(form.getOriginalValue(scope)).toStrictEqual([0, 4, 2])
  })

  it("passes an element in the list transform function", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0),
      ImpulseFormValue.of(1),
      ImpulseFormValue.of(2),
    ])

    form.setOriginalValue((elements) => elements.map(() => (x) => x + 1))
    expect(form.getOriginalValue(scope)).toStrictEqual([1, 2, 3])
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

  it("returns empty array for empty list", ({ scope }) => {
    const form = ImpulseFormList.of([])

    expect(form.getInitialValue(scope)).toStrictEqual([])
  })

  it("returns an array of original values", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0, { initialValue: 3 }),
      ImpulseFormValue.of(1),
      ImpulseFormValue.of(2, { initialValue: 4 }),
    ])

    expect(form.getInitialValue(scope)).toStrictEqual([3, 1, 4])
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

  it("changes all items", ({ scope }) => {
    const form = ImpulseFormList.of([
      ImpulseFormValue.of(0),
      ImpulseFormValue.of(1),
      ImpulseFormValue.of(2),
    ])

    form.setInitialValue([3, 4, 5])
    expect(form.getInitialValue(scope)).toStrictEqual([3, 4, 5])
  })
})
