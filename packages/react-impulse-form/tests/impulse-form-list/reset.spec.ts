import { renderHook } from "@testing-library/react"
import { useScopedEffect } from "react-impulse"
import { z } from "zod"

import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import { ImpulseFormList, ImpulseFormShape, ImpulseFormUnit } from "../../src"
import { wait } from "../common"

beforeAll(() => {
  vi.useFakeTimers()
})

it("matches the type definition", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, {
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
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { initial: 1 }),
    ImpulseFormUnit(1, { initial: 2 }),
    ImpulseFormUnit(2, { initial: 3 }),
  ])

  form.reset()
  expect(form.getOutput(scope)).toStrictEqual([1, 2, 3])
})

it("clears custom errors", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { error: ["error"] }),
    ImpulseFormUnit(1, { error: ["error"] }),
    ImpulseFormUnit(2, { error: ["error"] }),
  ])

  form.reset()
  expect(form.getError(scope)).toBeNull()
})

it("resets isValidated state", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { schema: z.number() }),
    ImpulseFormUnit(1, { schema: z.number() }),
    ImpulseFormUnit(2, { schema: z.number() }),
  ])

  form.setTouched(true)
  expect(form.isValidated(scope)).toBe(true)

  form.reset()
  expect(form.isValidated(scope)).toBe(false)
})

it("provides the initial value to the element resetter 1st argument", ({
  scope,
}) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { initial: 1 }),
    ImpulseFormUnit(1, { initial: 2 }),
    ImpulseFormUnit(2, { initial: 3 }),
  ])

  form.reset((initial) => initial.map((x) => x + 1))
  expect(form.getOutput(scope)).toStrictEqual([2, 3, 4])
})

it("provides the original value to the resetter 2nd argument", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { initial: 1 }),
    ImpulseFormUnit(1, { initial: 2 }),
    ImpulseFormUnit(2, { initial: 3 }),
  ])

  form.reset((_, original) => original.map((x) => x + 1))
  expect(form.getInput(scope)).toStrictEqual([1, 2, 3])
})

it("restores removed elements", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { initial: 1 }),
    ImpulseFormUnit(1, { initial: 2 }),
    ImpulseFormUnit(2, { initial: 3 }),
  ])

  form.setElements((elements) => elements.slice(0, 2))
  expect(form.getInput(scope)).toStrictEqual([0, 1])
  expect(form.getInitial(scope)).toStrictEqual([1, 2, 3])

  form.reset()
  expect(form.getInput(scope)).toStrictEqual([1, 2, 3])
  expect(form.getInitial(scope)).toStrictEqual([1, 2, 3])
})

it("restores all elements", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { initial: 1 }),
    ImpulseFormUnit(1, { initial: 2 }),
    ImpulseFormUnit(2, { initial: 3 }),
  ])

  form.setElements([])
  expect(form.getInput(scope)).toStrictEqual([])
  expect(form.getInitial(scope)).toStrictEqual([1, 2, 3])

  form.reset()
  expect(form.getInput(scope)).toStrictEqual([1, 2, 3])
  expect(form.getInitial(scope)).toStrictEqual([1, 2, 3])
})

it("removes added element", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { initial: 1 }),
    ImpulseFormUnit(1, { initial: 2 }),
    ImpulseFormUnit(2, { initial: 3 }),
  ])

  form.setElements((elements) => [
    ...elements,
    ImpulseFormUnit(3, { initial: 4 }),
  ])
  expect(form.getInput(scope)).toStrictEqual([0, 1, 2, 3])
  expect(form.getInitial(scope)).toStrictEqual([1, 2, 3])

  form.reset()
  expect(form.getInput(scope)).toStrictEqual([1, 2, 3])
  expect(form.getInitial(scope)).toStrictEqual([1, 2, 3])
})

it("removes all elements", ({ scope }) => {
  const form = ImpulseFormList<ImpulseFormUnit<number>>([])

  form.setElements([
    ImpulseFormUnit(0, { initial: 1 }),
    ImpulseFormUnit(1, { initial: 2 }),
    ImpulseFormUnit(2, { initial: 3 }),
  ])
  expect(form.getInput(scope)).toStrictEqual([0, 1, 2])
  expect(form.getInitial(scope)).toStrictEqual([])

  form.reset()
  expect(form.getInput(scope)).toStrictEqual([])
  expect(form.getInitial(scope)).toStrictEqual([])
})

it("updates validateOn for restored elements", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { schema: z.number(), validateOn: "onChange" }),
    ImpulseFormUnit(1, { schema: z.number(), validateOn: "onChange" }),
    ImpulseFormUnit(2, { schema: z.number(), validateOn: "onChange" }),
  ])

  form.setElements([ImpulseFormUnit(0, { schema: z.number() })])
  form.setValidateOn("onInit")
  expect(form.getValidateOn(scope)).toBe("onInit")

  form.reset()
  expect(form.getValidateOn(scope)).toBe("onInit")
})

it("updates submit count for restored elements", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0),
    ImpulseFormUnit(1),
    ImpulseFormUnit(2),
  ])

  form.setElements([ImpulseFormUnit(0)])
  void form.submit()
  expect(form.getSubmitCount(scope)).toBe(1)
  expect(
    form.getElements(scope).map((element) => element.getSubmitCount(scope)),
  ).toStrictEqual([1])

  form.reset()
  expect(form.getSubmitCount(scope)).toBe(1)
  expect(
    form.getElements(scope).map((element) => element.getSubmitCount(scope)),
  ).toStrictEqual([1, 1, 1])
})

it("updates isSubmitting for restored elements", async ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0),
    ImpulseFormUnit(1),
    ImpulseFormUnit(2),
  ])

  form.onSubmit(() => wait(1000))

  form.setElements([ImpulseFormUnit(0)])
  void form.submit()
  expect(form.isSubmitting(scope)).toBe(true)
  expect(
    form.getElements(scope).map((element) => element.isSubmitting(scope)),
  ).toStrictEqual([true])

  form.reset()
  expect(form.isSubmitting(scope)).toBe(true)
  expect(
    form.getElements(scope).map((element) => element.isSubmitting(scope)),
  ).toStrictEqual([true, true, true])

  await vi.advanceTimersByTimeAsync(1000)
  expect(form.isSubmitting(scope)).toBe(false)
  expect(
    form.getElements(scope).map((element) => element.isSubmitting(scope)),
  ).toStrictEqual([false, false, false])
})

/**
 * bugfix: ImpulseFormList.reset() restores not initial values #923
 * @link https://github.com/owanturist/react-impulse/issues/923
 */
describe("when resetting elements with metadata", () => {
  it("restores after removing leading", ({ scope }) => {
    const form = ImpulseFormList([
      ImpulseFormShape({
        id: 1,
        name: ImpulseFormUnit("1"),
      }),
      ImpulseFormShape({
        id: 2,
        name: ImpulseFormUnit("2"),
      }),
    ])

    form.setElements(([, second]) => [second!])
    form.reset((initial) => initial)

    expect(form.getInput(scope)).toStrictEqual([
      { id: 1, name: "1" },
      { id: 2, name: "2" },
    ])
  })

  it("restores after removing trailing", ({ scope }) => {
    const form = ImpulseFormList([
      ImpulseFormShape({
        id: 1,
        name: ImpulseFormUnit("1"),
      }),
      ImpulseFormShape({
        id: 2,
        name: ImpulseFormUnit("2"),
      }),
    ])

    form.setElements(([first]) => [first!])
    form.reset((initial) => initial)

    expect(form.getInput(scope)).toStrictEqual([
      { id: 1, name: "1" },
      { id: 2, name: "2" },
    ])
  })

  it("restores after adding leading", ({ scope }) => {
    const form = ImpulseFormList([
      ImpulseFormShape({
        id: 1,
        name: ImpulseFormUnit("1"),
      }),
    ])

    form.setElements((elements) => [
      ImpulseFormShape({
        id: 2,
        name: ImpulseFormUnit("2"),
      }),
      ...elements,
    ])

    expect(form.getInput(scope)).toStrictEqual([
      { id: 2, name: "2" },
      { id: 1, name: "1" },
    ])

    form.reset((initial) => initial)

    expect(form.getInput(scope)).toStrictEqual([{ id: 1, name: "1" }])
  })

  it("restores after adding leading and setting initial to input", ({
    scope,
  }) => {
    const form = ImpulseFormList([
      ImpulseFormShape({
        id: 1,
        name: ImpulseFormUnit("1"),
      }),
    ])

    form.setElements((elements) => [
      ImpulseFormShape({
        id: 2,
        name: ImpulseFormUnit("2"),
      }),
      ...elements,
    ])

    expect(form.getInput(scope)).toStrictEqual([
      { id: 2, name: "2" },
      { id: 1, name: "1" },
    ])
    expect(form.getInitial(scope)).toStrictEqual([{ id: 1, name: "1" }])

    form.reset((_initial, input) => input)

    expect(form.getInitial(scope)).toStrictEqual([
      { id: 2, name: "2" },
      { id: 1, name: "1" },
    ])
    expect(form.getInput(scope)).toStrictEqual([
      { id: 2, name: "2" },
      { id: 1, name: "1" },
    ])
  })
})

/**
 * bugfix: ImpulseForm.reset() does not run subscribers #969
 * @link https://github.com/owanturist/react-impulse/issues/969
 */
describe("when deriving error from output in useScopedEffect", () => {
  it("assigns error for the first element, resets it, and assigns again", ({
    scope,
  }) => {
    const form = ImpulseFormList(
      [1, 2].map((value) =>
        ImpulseFormUnit<number, string, boolean>(value, {
          transform: (x) => x > 0,
        }),
      ),
    )

    renderHook(
      (list) => {
        useScopedEffect(
          (scope) => {
            const elements = list.getElements(scope)

            for (const element of elements) {
              if (element.getOutput(scope) === false) {
                element.setError("error")
              }
            }
          },
          [list],
        )
      },
      {
        initialProps: form,
      },
    )

    // initially both are valid
    expect(form.getError(scope)).toBeNull()

    // set invalid value for the first element
    form.getElements(scope).at(0)?.setInput(-1)
    expect(form.getError(scope)).toStrictEqual(["error", null])
    expect(form.getOutput(scope, params._second)).toStrictEqual([null, true])

    // reset the form, which should clear the error and set the input to initial
    form.reset()
    expect(form.getError(scope)).toBeNull()
    expect(form.getOutput(scope, params._second)).toStrictEqual([true, true])

    // set invalid value for the first element again, which should assign the error again
    form.getElements(scope).at(0)?.setInput(-1)
    expect(form.getError(scope)).toStrictEqual(["error", null])
    expect(form.getOutput(scope, params._second)).toStrictEqual([null, true])
  })
})
