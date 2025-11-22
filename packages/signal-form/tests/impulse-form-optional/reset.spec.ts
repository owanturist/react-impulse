import z from "zod"

import { params } from "~/tools/params"

import { ImpulseFormOptional, ImpulseFormShape, ImpulseFormUnit } from "../../src"

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
        enabled,
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
        enabled,
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
        enabled,
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
      enabled: (initialEnabled, inputEnabled) => {
        expect(initialEnabled).toBe(true)
        expect(inputEnabled).toBe(true)

        return false
      },

      element: (initialElement, inputElement) => {
        expect(initialElement).toStrictEqual({
          enabled: false,
          element: {
            _1: 2,
            _2: "0",
            _3: false,
          },
        })
        expect(inputElement).toStrictEqual({
          enabled: true,
          element: {
            _1: 0,
            _2: "0",
            _3: true,
          },
        })

        return {
          enabled: (initialElementEnabled, inputElementEnabled) => {
            expect(initialElementEnabled).toBe(false)
            expect(inputElementEnabled).toBe(true)

            return true
          },

          element: (initialElementElement, inputElementElement) => {
            expect(initialElementElement).toStrictEqual({
              _1: 2,
              _2: "0",
              _3: false,
            })
            expect(inputElementElement).toStrictEqual({
              _1: 0,
              _2: "0",
              _3: true,
            })

            return {
              _1: (initialElement1, inputElement1) => {
                expect(initialElement1).toBe(2)
                expect(inputElement1).toBe(0)

                return 10
              },

              _2: (initialElement2, inputElement2) => {
                expect(initialElement2).toBe("0")
                expect(inputElement2).toBe("0")

                return "updated"
              },

              _3: (initialElement3, inputElement3) => {
                expect(initialElement3).toBe(false)
                expect(inputElement3).toBe(true)

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
