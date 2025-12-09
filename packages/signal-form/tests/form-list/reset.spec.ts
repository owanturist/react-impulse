import { z } from "zod"

import type { Setter } from "~/tools/setter"

import { FormList, FormShape, FormUnit } from "../../src"
import { wait } from "../common"

beforeAll(() => {
  vi.useFakeTimers()
})

it("matches the type definition", ({ monitor }) => {
  const form = FormList([
    FormUnit(0, {
      schema: z.number().transform((x) => x.toFixed(0)),
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

  expectTypeOf(form.getElements(monitor).at(0)!.reset).toEqualTypeOf<
    (resetter?: Setter<number, [number, number]>) => void
  >()
})

it("sets initial values for all items", ({ monitor }) => {
  const form = FormList([
    FormUnit(0, { initial: 1 }),
    FormUnit(1, { initial: 2 }),
    FormUnit(2, { initial: 3 }),
  ])

  form.reset()
  expect(form.getOutput(monitor)).toStrictEqual([1, 2, 3])
})

it("clears custom errors", ({ monitor }) => {
  const form = FormList([
    FormUnit(0, { error: ["error"] }),
    FormUnit(1, { error: ["error"] }),
    FormUnit(2, { error: ["error"] }),
  ])

  form.reset()
  expect(form.getError(monitor)).toBeNull()
})

it("resets isValidated state", ({ monitor }) => {
  const form = FormList([
    FormUnit(0, { schema: z.number() }),
    FormUnit(1, { schema: z.number() }),
    FormUnit(2, { schema: z.number() }),
  ])

  form.setTouched(true)
  expect(form.isValidated(monitor)).toBe(true)

  form.reset()
  expect(form.isValidated(monitor)).toBe(false)
})

it("provides the initial value to the element resetter 1st argument", ({ monitor }) => {
  const form = FormList([
    FormUnit(0, { initial: 1 }),
    FormUnit(1, { initial: 2 }),
    FormUnit(2, { initial: 3 }),
  ])

  form.reset((initial) => initial.map((x) => x + 1))
  expect(form.getOutput(monitor)).toStrictEqual([2, 3, 4])
})

it("provides the original value to the resetter 2nd argument", ({ monitor }) => {
  const form = FormList([
    FormUnit(0, { initial: 1 }),
    FormUnit(1, { initial: 2 }),
    FormUnit(2, { initial: 3 }),
  ])

  form.reset((_, original) => original.map((x) => x + 1))
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
})

it("restores removed elements", ({ monitor }) => {
  const form = FormList([
    FormUnit(0, { initial: 1 }),
    FormUnit(1, { initial: 2 }),
    FormUnit(2, { initial: 3 }),
  ])

  form.setElements((elements) => elements.slice(0, 2))
  expect(form.getInput(monitor)).toStrictEqual([0, 1])
  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])

  form.reset()
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])
})

it("restores all elements", ({ monitor }) => {
  const form = FormList([
    FormUnit(0, { initial: 1 }),
    FormUnit(1, { initial: 2 }),
    FormUnit(2, { initial: 3 }),
  ])

  form.setElements([])
  expect(form.getInput(monitor)).toStrictEqual([])
  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])

  form.reset()
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])
})

it("removes added element", ({ monitor }) => {
  const form = FormList([
    FormUnit(0, { initial: 1 }),
    FormUnit(1, { initial: 2 }),
    FormUnit(2, { initial: 3 }),
  ])

  form.setElements((elements) => [...elements, FormUnit(3, { initial: 4 })])
  expect(form.getInput(monitor)).toStrictEqual([0, 1, 2, 3])
  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])

  form.reset()
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])
})

it("removes all elements", ({ monitor }) => {
  const form = FormList<FormUnit<number>>([])

  form.setElements([
    FormUnit(0, { initial: 1 }),
    FormUnit(1, { initial: 2 }),
    FormUnit(2, { initial: 3 }),
  ])
  expect(form.getInput(monitor)).toStrictEqual([0, 1, 2])
  expect(form.getInitial(monitor)).toStrictEqual([])

  form.reset()
  expect(form.getInput(monitor)).toStrictEqual([])
  expect(form.getInitial(monitor)).toStrictEqual([])
})

it("updates validateOn for restored elements", ({ monitor }) => {
  const form = FormList([
    FormUnit(0, { schema: z.number(), validateOn: "onChange" }),
    FormUnit(1, { schema: z.number(), validateOn: "onChange" }),
    FormUnit(2, { schema: z.number(), validateOn: "onChange" }),
  ])

  form.setElements([FormUnit(0, { schema: z.number() })])
  form.setValidateOn("onInit")
  expect(form.getValidateOn(monitor)).toBe("onInit")

  form.reset()
  expect(form.getValidateOn(monitor)).toBe("onInit")
})

it("updates submit count for restored elements", ({ monitor }) => {
  const form = FormList([FormUnit(0), FormUnit(1), FormUnit(2)])

  form.setElements([FormUnit(0)])
  form.submit()
  expect(form.getSubmitCount(monitor)).toBe(1)
  expect(form.getElements(monitor).map((element) => element.getSubmitCount(monitor))).toStrictEqual(
    [1],
  )

  form.reset()
  expect(form.getSubmitCount(monitor)).toBe(1)
  expect(form.getElements(monitor).map((element) => element.getSubmitCount(monitor))).toStrictEqual(
    [1, 1, 1],
  )
})

it("updates isSubmitting for restored elements", async ({ monitor }) => {
  const form = FormList([FormUnit(0), FormUnit(1), FormUnit(2)])

  form.onSubmit(() => wait(1000))

  form.setElements([FormUnit(0)])
  form.submit()
  expect(form.isSubmitting(monitor)).toBe(true)
  expect(form.getElements(monitor).map((element) => element.isSubmitting(monitor))).toStrictEqual([
    true,
  ])

  form.reset()
  expect(form.isSubmitting(monitor)).toBe(true)
  expect(form.getElements(monitor).map((element) => element.isSubmitting(monitor))).toStrictEqual([
    true,
    true,
    true,
  ])

  await vi.advanceTimersByTimeAsync(1000)
  expect(form.isSubmitting(monitor)).toBe(false)
  expect(form.getElements(monitor).map((element) => element.isSubmitting(monitor))).toStrictEqual([
    false,
    false,
    false,
  ])
})

/**
 * bugfix: FormList.reset() restores not initial values #923
 * @link https://github.com/owanturist/react-impulse/issues/923
 */
describe("when resetting elements with metadata", () => {
  it("restores after removing leading", ({ monitor }) => {
    const form = FormList([
      FormShape({
        id: 1,
        name: FormUnit("1"),
      }),
      FormShape({
        id: 2,
        name: FormUnit("2"),
      }),
    ])

    form.setElements(([, second]) => [second!])
    form.reset((initial) => initial)

    expect(form.getInput(monitor)).toStrictEqual([
      { id: 1, name: "1" },
      { id: 2, name: "2" },
    ])
  })

  it("restores after removing trailing", ({ monitor }) => {
    const form = FormList([
      FormShape({
        id: 1,
        name: FormUnit("1"),
      }),
      FormShape({
        id: 2,
        name: FormUnit("2"),
      }),
    ])

    form.setElements(([first]) => [first!])
    form.reset((initial) => initial)

    expect(form.getInput(monitor)).toStrictEqual([
      { id: 1, name: "1" },
      { id: 2, name: "2" },
    ])
  })

  it("restores after adding leading", ({ monitor }) => {
    const form = FormList([
      FormShape({
        id: 1,
        name: FormUnit("1"),
      }),
    ])

    form.setElements((elements) => [
      FormShape({
        id: 2,
        name: FormUnit("2"),
      }),
      ...elements,
    ])

    expect(form.getInput(monitor)).toStrictEqual([
      { id: 2, name: "2" },
      { id: 1, name: "1" },
    ])

    form.reset((initial) => initial)

    expect(form.getInput(monitor)).toStrictEqual([{ id: 1, name: "1" }])
  })

  it("restores after adding leading and setting initial to input", ({ monitor }) => {
    const form = FormList([
      FormShape({
        id: 1,
        name: FormUnit("1"),
      }),
    ])

    form.setElements((elements) => [
      FormShape({
        id: 2,
        name: FormUnit("2"),
      }),
      ...elements,
    ])

    expect(form.getInput(monitor)).toStrictEqual([
      { id: 2, name: "2" },
      { id: 1, name: "1" },
    ])
    expect(form.getInitial(monitor)).toStrictEqual([{ id: 1, name: "1" }])

    form.reset((_initial, input) => input)

    expect(form.getInitial(monitor)).toStrictEqual([
      { id: 2, name: "2" },
      { id: 1, name: "1" },
    ])
    expect(form.getInput(monitor)).toStrictEqual([
      { id: 2, name: "2" },
      { id: 1, name: "1" },
    ])
  })
})
