import { untracked } from "@owanturist/signal"

import { ImpulseFormList, type ImpulseFormListOptions, ImpulseFormUnit } from "../../src"

function setup(options?: ImpulseFormListOptions<ImpulseFormUnit<number>>) {
  const form = ImpulseFormList(
    [ImpulseFormUnit(1), ImpulseFormUnit(2), ImpulseFormUnit(3)],
    options,
  )

  const listener0 = vi.fn()
  const listener1 = vi.fn()
  const listener2 = vi.fn()
  const listener3 = vi.fn()

  const elements = untracked((scope) => form.getElements(scope))

  form.onSubmit(listener0)
  elements.at(0)?.onSubmit(listener1)
  elements.at(1)?.onSubmit(listener2)
  elements.at(2)?.onSubmit(listener3)

  return [
    form,
    {
      listener0,
      listener1,
      listener2,
      listener3,
    },
  ] as const
}

it("does not call the listeners on init", () => {
  const [, { listener0, listener1, listener2, listener3 }] = setup()

  expect(listener0).not.toHaveBeenCalled()
  expect(listener1).not.toHaveBeenCalled()
  expect(listener2).not.toHaveBeenCalled()
  expect(listener3).not.toHaveBeenCalled()
})

it("provides values to the listeners", () => {
  const [form, { listener0, listener1, listener2, listener3 }] = setup()

  form.submit()

  expect(listener0).toHaveBeenCalledExactlyOnceWith([1, 2, 3])
  expect(listener1).toHaveBeenCalledExactlyOnceWith(1)
  expect(listener2).toHaveBeenCalledExactlyOnceWith(2)
  expect(listener3).toHaveBeenCalledExactlyOnceWith(3)
})
