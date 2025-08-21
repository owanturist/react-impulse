import z from "zod"

import { params } from "~/tools/params"

import {
  ImpulseFormOptional,
  ImpulseFormShape,
  ImpulseFormUnit,
} from "../../src"

describe.each([
  ["disabled", false],
  ["enabled", true],
])("when %s", (_, enabled) => {
  function setup() {
    return ImpulseFormOptional(
      ImpulseFormUnit(true, {
        initial: false,
        schema: z.boolean(),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit(enabled, {
          schema: z.boolean(),
        }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name", {
            touched: true,
          }),
          _2: ImpulseFormUnit(18, {
            initial: 20,
          }),
          _3: ImpulseFormUnit(true, {
            error: "error",
          }),
          _4: ImpulseFormUnit("0", {
            validateOn: "onInit",
            schema: z.number(),
          }),
        }),
      ),
    )
  }

  it("resets every initial input", ({ scope }) => {
    const form = setup()

    expect(form.getInput(scope)).toStrictEqual({
      enabled: true,
      element: {
        enabled: enabled,
        element: {
          _1: "name",
          _2: 18,
          _3: true,
          _4: "0",
        },
      },
    })

    form.reset()

    expect(form.getInput(scope)).toStrictEqual({
      enabled: false,
      element: {
        enabled: enabled,
        element: {
          _1: "name",
          _2: 20,
          _3: true,
          _4: "0",
        },
      },
    })
  })

  it("applies resetter to set initial values", ({ scope }) => {
    const form = setup()

    form.reset({
      enabled: true,
      element: {
        element: {
          _1: "another",
          _2: 100,
        },
      },
    })

    expect(form.getInput(scope)).toStrictEqual({
      enabled: true,
      element: {
        enabled: enabled,
        element: {
          _1: "another",
          _2: 100,
          _3: true,
          _4: "0",
        },
      },
    })
  })

  it("resets every touched", ({ scope }) => {
    const form = setup()

    expect(form.isTouched(scope, params._second)).toStrictEqual({
      enabled: false,
      element: {
        enabled: false,
        element: {
          _1: true,
          _2: false,
          _3: false,
          _4: false,
        },
      },
    })

    form.reset()

    expect(form.isTouched(scope, params._second)).toStrictEqual({
      enabled: false,
      element: {
        enabled: false,
        element: {
          _1: false,
          _2: false,
          _3: false,
          _4: false,
        },
      },
    })
  })

  it("resets every error", ({ scope }) => {
    const form = setup()

    expect(form.getError(scope, params._second)).toStrictEqual({
      enabled: null,
      element: {
        enabled: null,
        element: {
          _1: null,
          _2: null,
          _3: "error",
          _4: [expect.stringContaining("Invalid input")],
        },
      },
    })

    form.reset()

    expect(form.getError(scope, params._second)).toStrictEqual({
      enabled: null,
      element: {
        enabled: null,
        element: {
          _1: null,
          _2: null,
          _3: null,
          _4: [expect.stringContaining("Invalid input")],
        },
      },
    })
  })

  it("resets every validated", ({ scope }) => {
    const form = setup()

    form.enabled.setTouched(true)

    expect(form.isValidated(scope, params._second)).toStrictEqual({
      enabled: true,
      element: {
        enabled: false,
        element: {
          _1: true,
          _2: true,
          _3: true,
          _4: true,
        },
      },
    })

    form.reset()

    expect(form.isValidated(scope, params._second)).toStrictEqual({
      enabled: false,
      element: {
        enabled: false,
        element: {
          _1: true,
          _2: true,
          _3: true,
          _4: true,
        },
      },
    })
  })
})

it("using recursive resetter", ({ scope }) => {
  expect.assertions(18)

  const form = ImpulseFormOptional(
    ImpulseFormUnit(true),
    ImpulseFormOptional(
      ImpulseFormUnit(true, {
        initial: false,
        schema: z.boolean(),
      }),
      ImpulseFormShape({
        _1: ImpulseFormUnit(0, { initial: 1 }),
        _2: ImpulseFormUnit("0"),
        _3: ImpulseFormUnit(true, {
          schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
        }),
      }),
      {
        initial: {
          enabled: false,
          element: {
            _1: 2,
            _3: false,
          },
        },
      },
    ),
  )

  form.reset((initial, input) => {
    expect(initial).toStrictEqual({
      enabled: true,
      element: {
        enabled: false,
        element: {
          _1: 2,
          _2: "0",
          _3: false,
        },
      },
    })
    expect(input).toStrictEqual({
      enabled: true,
      element: {
        enabled: true,
        element: {
          _1: 0,
          _2: "0",
          _3: true,
        },
      },
    })

    return {
      enabled: (initial_enabled, input_enabled) => {
        expect(initial_enabled).toBe(true)
        expect(input_enabled).toBe(true)

        return false
      },

      element: (initial_element, input_element) => {
        expect(initial_element).toStrictEqual({
          enabled: false,
          element: {
            _1: 2,
            _2: "0",
            _3: false,
          },
        })
        expect(input_element).toStrictEqual({
          enabled: true,
          element: {
            _1: 0,
            _2: "0",
            _3: true,
          },
        })

        return {
          enabled: (initial_element_enabled, input_element_enabled) => {
            expect(initial_element_enabled).toBe(false)
            expect(input_element_enabled).toBe(true)

            return true
          },

          element: (initial_element_element, input_element_element) => {
            expect(initial_element_element).toStrictEqual({
              _1: 2,
              _2: "0",
              _3: false,
            })
            expect(input_element_element).toStrictEqual({
              _1: 0,
              _2: "0",
              _3: true,
            })

            return {
              _1: (initial_element__1, input_element__1) => {
                expect(initial_element__1).toBe(2)
                expect(input_element__1).toBe(0)

                return 10
              },

              _2: (initial_element__2, input_element__2) => {
                expect(initial_element__2).toBe("0")
                expect(input_element__2).toBe("0")

                return "updated"
              },

              _3: (initial_element__3, input_element__3) => {
                expect(initial_element__3).toBe(false)
                expect(input_element__3).toBe(true)

                return true
              },
            }
          },
        }
      },
    }
  })

  const initial = form.getInitial(scope)

  expect(form.getInput(scope)).toStrictEqual(initial)
  expect(initial).toStrictEqual({
    enabled: false,
    element: {
      enabled: true,
      element: {
        _1: 10,
        _2: "updated",
        _3: true,
      },
    },
  })
})
