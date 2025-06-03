import { untrack } from "react-impulse"
import { z } from "zod"

import {
  ImpulseFormList,
  type ImpulseFormListOptions,
  ImpulseFormUnit,
} from "../../src"

function setup(
  options?: ImpulseFormListOptions<
    ImpulseFormUnit<number, ReadonlyArray<string>>
  >,
) {
  const form = ImpulseFormList(
    [
      ImpulseFormUnit(0, { schema: z.number() }),
      ImpulseFormUnit(1, { schema: z.number() }),
      ImpulseFormUnit(2, { schema: z.number() }),
    ],
    options,
  )

  const listener_0 = vi.fn()
  const listener_1 = vi.fn()
  const listener_2 = vi.fn()

  const elements = untrack((scope) => form.getElements(scope))

  elements.at(0)?.onFocusWhenInvalid(listener_0)
  elements.at(1)?.onFocusWhenInvalid(listener_1)
  elements.at(2)?.onFocusWhenInvalid(listener_2)

  return [
    form,
    {
      listener_0,
      listener_1,
      listener_2,
    },
  ] as const
}

it("does not call listeners on init", () => {
  const [, { listener_0, listener_1, listener_2 }] = setup({
    error: [["error0"], ["error1"], ["error2"]],
  })

  expect(listener_0).not.toHaveBeenCalled()
  expect(listener_1).not.toHaveBeenCalled()
  expect(listener_2).not.toHaveBeenCalled()
})

it("does not focus any when all valid", () => {
  const [form, { listener_0, listener_1, listener_2 }] = setup()

  form.focusFirstInvalid()

  expect(listener_0).not.toHaveBeenCalled()
  expect(listener_1).not.toHaveBeenCalled()
  expect(listener_2).not.toHaveBeenCalled()
})

it("focuses the first invalid element", () => {
  const [form, { listener_0, listener_1, listener_2 }] = setup({
    error: [["error0"], ["error1"], ["error2"]],
  })

  form.focusFirstInvalid()

  expect(listener_0).toHaveBeenCalledExactlyOnceWith(["error0"])
  expect(listener_1).not.toHaveBeenCalled()
  expect(listener_2).not.toHaveBeenCalled()
})

it("calls the only invalid", () => {
  const [form, { listener_0, listener_1, listener_2 }] = setup({
    error: [undefined, ["error1"]],
  })

  form.focusFirstInvalid()

  expect(listener_0).not.toHaveBeenCalled()
  expect(listener_1).toHaveBeenCalledExactlyOnceWith(["error1"])
  expect(listener_2).not.toHaveBeenCalled()
})

it("does not focus invalid without listener", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(1, { error: "err-1" }),
    ImpulseFormUnit(2, { error: "err-2" }),
  ])

  const listener_1 = vi.fn()

  form.getElements(scope).at(1)?.onFocusWhenInvalid(listener_1)

  form.focusFirstInvalid()
  expect(listener_1).toHaveBeenCalledExactlyOnceWith("err-2")
})

describe("with onFocusWhenInvalid()", () => {
  it("does nothing when elements are empty", () => {
    const form = ImpulseFormList([])
    const listener_0 = vi.fn()

    form.onFocusWhenInvalid(listener_0)
    form.focusFirstInvalid()
    expect(listener_0).not.toHaveBeenCalled()
  })

  it("does not call a listener when elements are not validated", () => {
    const form = ImpulseFormList([
      ImpulseFormUnit("", {
        schema: z.string(),
      }),
    ])

    const listener_0 = vi.fn()

    form.onFocusWhenInvalid(listener_0)
    form.focusFirstInvalid()
    expect(listener_0).not.toHaveBeenCalled()
  })

  it("does not call a listener when elements are valid", () => {
    const form = ImpulseFormList([
      ImpulseFormUnit("valid", {
        validateOn: "onInit",
        schema: z.string().min(2),
      }),
    ])

    const listener_0 = vi.fn()

    form.onFocusWhenInvalid(listener_0)
    form.focusFirstInvalid()
    expect(listener_0).not.toHaveBeenCalled()
  })

  it("calls a listener when an element is not valid", () => {
    const form = ImpulseFormList([
      ImpulseFormUnit("", {
        validateOn: "onInit",
        schema: z.string().min(2),
      }),
    ])

    const listener_0 = vi.fn()

    form.onFocusWhenInvalid(listener_0)
    form.focusFirstInvalid()
    expect(listener_0).toHaveBeenCalledExactlyOnceWith([
      ["String must contain at least 2 character(s)"],
    ])
  })

  it("does not call a listener when an element is invalid and has own listener", ({
    scope,
  }) => {
    const form = ImpulseFormList([
      ImpulseFormUnit("", {
        validateOn: "onInit",
        schema: z.string().min(2),
      }),
    ])

    const listener_0 = vi.fn()
    const listener_1 = vi.fn()

    form.onFocusWhenInvalid(listener_0)
    form.getElements(scope).at(0)?.onFocusWhenInvalid(listener_1)
    form.focusFirstInvalid()

    expect(listener_0).not.toHaveBeenCalled()
    expect(listener_1).toHaveBeenCalledExactlyOnceWith([
      "String must contain at least 2 character(s)",
    ])
  })
})
