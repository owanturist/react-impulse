import { z } from "zod"

import type { Setter } from "~/tools/setter"

import { ImpulseFormList, ImpulseFormUnit } from "../../src"
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

it.skip("restores removed elements", ({ scope }) => {
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

it.skip("restores all elements", ({ scope }) => {
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

it.skip("removes added element", ({ scope }) => {
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

it.skip("removes all elements", ({ scope }) => {
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

it.skip("updates validateOn for restored elements", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { schema: z.number(), validateOn: "onChange" }),
    ImpulseFormUnit(1, { schema: z.number(), validateOn: "onChange" }),
    ImpulseFormUnit(2, { schema: z.number(), validateOn: "onChange" }),
  ])

  form.setElements([ImpulseFormUnit(0)])
  form.setValidateOn("onInit")
  expect(form.getValidateOn(scope)).toBe("onInit")

  form.reset()
  expect(form.getValidateOn(scope)).toBe("onInit")
})

it.skip("updates submit count for restored elements", ({ scope }) => {
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

it.skip("updates isSubmitting for restored elements", async ({ scope }) => {
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
