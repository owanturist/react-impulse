import z from "zod"

import { params } from "~/tools/params"

import { FormShape, FormSwitch, FormUnit } from "../../src"

function setup() {
  return FormSwitch(
    FormUnit("_1", {
      initial: "_2",
      schema: z.enum(["_1", "_2", "_5"]),
    }),
    {
      _1: FormUnit(1, {
        initial: 0,
        validateOn: "onInit",
        schema: z.number().min(1),
        error: ["custom error"],
      }),

      _2: FormShape({
        _3: FormUnit("name", {
          touched: true,
        }),
        _4: FormUnit(18, {
          initial: 20,
        }),
      }),

      _5: FormSwitch(
        FormUnit<"_6" | "_7">("_6", {
          touched: true,
        }),
        {
          _6: FormUnit(0, {
            error: "error",
          }),
          _7: FormUnit("0", {
            schema: z.number(),
          }),
        },
      ),
    },
  )
}

it("resets every initial input", ({ monitor }) => {
  const form = setup()

  expect(form.getInput(monitor)).toStrictEqual({
    active: "_1",
    branches: {
      _1: 1,
      _2: {
        _3: "name",
        _4: 18,
      },
      _5: {
        active: "_6",
        branches: {
          _6: 0,
          _7: "0",
        },
      },
    },
  })

  form.reset()

  expect(form.getInput(monitor)).toStrictEqual({
    active: "_2",
    branches: {
      _1: 0,
      _2: {
        _3: "name",
        _4: 20,
      },
      _5: {
        active: "_6",
        branches: {
          _6: 0,
          _7: "0",
        },
      },
    },
  })
})

it("applies resetter to set initial values", ({ monitor }) => {
  const form = setup()

  form.reset({
    active: "_1",
    branches: {
      _1: 123,
      _2: {
        _4: 456,
      },
      _5: {
        branches: {
          _7: "789",
        },
      },
    },
  })

  expect(form.getInput(monitor)).toStrictEqual({
    active: "_1",
    branches: {
      _1: 123,
      _2: {
        _3: "name",
        _4: 456,
      },
      _5: {
        active: "_6",
        branches: {
          _6: 0,
          _7: "789",
        },
      },
    },
  })
})

it("resets every touched", ({ monitor }) => {
  const form = setup()

  expect(form.isTouched(monitor, params._second)).toStrictEqual({
    active: false,
    branches: {
      _1: false,
      _2: {
        _3: true,
        _4: false,
      },
      _5: {
        active: true,
        branches: {
          _6: false,
          _7: false,
        },
      },
    },
  })

  form.reset()

  expect(form.isTouched(monitor, params._second)).toStrictEqual({
    active: false,
    branches: {
      _1: false,
      _2: {
        _3: false,
        _4: false,
      },
      _5: {
        active: false,
        branches: {
          _6: false,
          _7: false,
        },
      },
    },
  })
})

it("resets every error", ({ monitor }) => {
  const form = setup()

  expect(form.getError(monitor, params._second)).toStrictEqual({
    active: null,
    branches: {
      _1: ["custom error"],
      _2: {
        _3: null,
        _4: null,
      },
      _5: {
        active: null,
        branches: {
          _6: "error",
          _7: null,
        },
      },
    },
  })

  form.reset()

  expect(form.getError(monitor, params._second)).toStrictEqual({
    active: null,
    branches: {
      _1: [expect.stringContaining("Too small")],
      _2: {
        _3: null,
        _4: null,
      },
      _5: {
        active: null,
        branches: {
          _6: null,
          _7: null,
        },
      },
    },
  })
})

it("resets every validated", ({ monitor }) => {
  const form = setup()

  form.setTouched({
    active: true,
  })

  expect(form.isValidated(monitor, params._second)).toStrictEqual({
    active: true,
    branches: {
      _1: true,
      _2: {
        _3: true,
        _4: true,
      },
      _5: {
        active: true,
        branches: {
          _6: true,
          _7: false,
        },
      },
    },
  })

  form.reset()

  expect(form.isValidated(monitor, params._second)).toStrictEqual({
    active: false,
    branches: {
      _1: true,
      _2: {
        _3: true,
        _4: true,
      },
      _5: {
        active: true,
        branches: {
          _6: true,
          _7: false,
        },
      },
    },
  })
})

it("using recursive resetter", ({ monitor }) => {
  expect.assertions(26)

  const form = FormSwitch(
    FormUnit("", {
      schema: z.enum(["_1", "_2", "_5"]),
      initial: "_12",
    }),
    {
      _1: FormUnit(true, {
        initial: false,
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: FormShape(
        {
          _3: FormUnit("name", {
            initial: "initial",
          }),
          _4: FormUnit(18),
        },
        {
          initial: {
            _4: 100,
          },
        },
      ),
      _5: FormSwitch(
        FormUnit("_6", {
          schema: z.enum(["_6", "_7"]),
        }),
        {
          _6: FormUnit(0, { initial: 1 }),
          _7: FormUnit("0"),
        },
        {
          initial: {
            active: "_7",
            branches: {
              _6: 2,
            },
          },
        },
      ),
    },
  )

  form.reset((initial, input) => {
    expect(initial).toStrictEqual({
      active: "_12",
      branches: {
        _1: false,
        _2: {
          _3: "initial",
          _4: 100,
        },
        _5: {
          active: "_7",
          branches: {
            _6: 2,
            _7: "0",
          },
        },
      },
    })
    expect(input).toStrictEqual({
      active: "",
      branches: {
        _1: true,
        _2: {
          _3: "name",
          _4: 18,
        },
        _5: {
          active: "_6",
          branches: {
            _6: 0,
            _7: "0",
          },
        },
      },
    })

    return {
      active: (initialActive, inputActive) => {
        expect(initialActive).toBe("_12")
        expect(inputActive).toBe("")

        return "_1"
      },

      branches: (initialBranches, inputBranches) => {
        expect(initialBranches).toStrictEqual({
          _1: false,
          _2: {
            _3: "initial",
            _4: 100,
          },
          _5: {
            active: "_7",
            branches: {
              _6: 2,
              _7: "0",
            },
          },
        })
        expect(inputBranches).toStrictEqual({
          _1: true,
          _2: {
            _3: "name",
            _4: 18,
          },
          _5: {
            active: "_6",
            branches: {
              _6: 0,
              _7: "0",
            },
          },
        })

        return {
          _1: (initial1, input1) => {
            expect(initial1).toBe(false)
            expect(input1).toBe(true)

            return true
          },

          _2: (initial2, input2) => {
            expect(initial2).toStrictEqual({
              _3: "initial",
              _4: 100,
            })
            expect(input2).toStrictEqual({
              _3: "name",
              _4: 18,
            })

            return {
              _3: (initial3, input3) => {
                expect(initial3).toBe("initial")
                expect(input3).toBe("name")

                return "updated"
              },

              _4: (initial4, input4) => {
                expect(initial4).toBe(100)
                expect(input4).toBe(18)

                return 30
              },
            }
          },

          _5: (initial5, input5) => {
            expect(initial5).toStrictEqual({
              active: "_7",
              branches: {
                _6: 2,
                _7: "0",
              },
            })
            expect(input5).toStrictEqual({
              active: "_6",
              branches: {
                _6: 0,
                _7: "0",
              },
            })

            return {
              active: (initialActive, inputActive) => {
                expect(initialActive).toBe("_7")
                expect(inputActive).toBe("_6")

                return "_5"
              },

              branches: (initialBranches, inputBranches) => {
                expect(initialBranches).toStrictEqual({
                  _6: 2,
                  _7: "0",
                })
                expect(inputBranches).toStrictEqual({
                  _6: 0,
                  _7: "0",
                })

                return {
                  _6: (initial6, input6) => {
                    expect(initial6).toBe(2)
                    expect(input6).toBe(0)

                    return 3
                  },

                  _7: (initial7, input7) => {
                    expect(initial7).toBe("0")
                    expect(input7).toBe("0")

                    return "3"
                  },
                }
              },
            }
          },
        }
      },
    }
  })

  const initial = form.getInitial(monitor)

  expect(form.getInput(monitor)).toStrictEqual(initial)
  expect(initial).toStrictEqual({
    active: "_1",
    branches: {
      _1: true,
      _2: {
        _3: "updated",
        _4: 30,
      },
      _5: {
        active: "_5",
        branches: {
          _6: 3,
          _7: "3",
        },
      },
    },
  })
})
