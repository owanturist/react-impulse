import { untrack } from "react-impulse"

import {
  ImpulseFormList,
  type ImpulseFormListOptions,
  ImpulseFormUnit,
} from "../../src"

function setup(options?: ImpulseFormListOptions<ImpulseFormUnit<number>>) {
  const form = ImpulseFormList(
    [ImpulseFormUnit(1), ImpulseFormUnit(2), ImpulseFormUnit(3)],
    options,
  )

  const listener_0 = vi.fn()
  const listener_1 = vi.fn()
  const listener_2 = vi.fn()
  const listener_3 = vi.fn()

  const elements = untrack((scope) => form.getElements(scope))

  form.onSubmit(listener_0)
  elements.at(0)?.onSubmit(listener_1)
  elements.at(1)?.onSubmit(listener_2)
  elements.at(2)?.onSubmit(listener_3)

  return [
    form,
    {
      listener_0,
      listener_1,
      listener_2,
      listener_3,
    },
  ] as const
}

it("does not call the listeners on init", () => {
  const [, { listener_0, listener_1, listener_2, listener_3 }] = setup()

  expect(listener_0).not.toHaveBeenCalled()
  expect(listener_1).not.toHaveBeenCalled()
  expect(listener_2).not.toHaveBeenCalled()
  expect(listener_3).not.toHaveBeenCalled()
})

it("provides values to the listeners", () => {
  const [form, { listener_0, listener_1, listener_2, listener_3 }] = setup()

  void form.submit()

  expect(listener_0).toHaveBeenCalledExactlyOnceWith([1, 2, 3])
  expect(listener_1).toHaveBeenCalledExactlyOnceWith(1)
  expect(listener_2).toHaveBeenCalledExactlyOnceWith(2)
  expect(listener_3).toHaveBeenCalledExactlyOnceWith(3)
})

it("deatches the listener when an element is removed")
