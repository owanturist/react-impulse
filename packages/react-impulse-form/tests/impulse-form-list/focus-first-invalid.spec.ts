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
