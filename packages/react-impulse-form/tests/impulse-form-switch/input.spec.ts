import type { Scope } from "react-impulse"
import z from "zod"

import type { Setter } from "~/tools/setter"

import { ImpulseFormShape, ImpulseFormSwitch, ImpulseFormUnit } from "../../src"

describe("types", () => {
  const active = ImpulseFormUnit("", {
    schema: z.enum(["_1", "_2"]),
  })

  const branches = {
    _1: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    _2: ImpulseFormShape({
      _3: ImpulseFormUnit("name"),
      _4: ImpulseFormUnit(18),
    }),
  }

  const form = ImpulseFormSwitch(active, branches)

  interface InputSchema {
    readonly active: string
    readonly branches: {
      readonly _1: boolean
      readonly _2: {
        readonly _3: string
        readonly _4: number
      }
    }
  }

  type InputSetter = Setter<
    {
      readonly active?: Setter<string, [string, string]>
      readonly branches?: Setter<
        {
          readonly _1?: Setter<boolean, [boolean, boolean]>
          readonly _2?: Setter<
            {
              readonly _3?: Setter<string, [string, string]>
              readonly _4?: Setter<number, [number, number]>
            },
            [InputSchema["branches"]["_2"], InputSchema["branches"]["_2"]]
          >
        },
        [InputSchema["branches"], InputSchema["branches"]]
      >
    },
    [InputSchema, InputSchema]
  >

  it("matches setter type for ImpulseFormSwitchOptions.input", () => {
    expectTypeOf<typeof ImpulseFormSwitch<typeof active, typeof branches>>()
      .parameter(2)
      .exclude<undefined>()
      .toHaveProperty("input")
      .toEqualTypeOf<undefined | InputSetter>()
  })

  it("matches schema type for getInput(scope)", ({ scope }) => {
    expectTypeOf(form.getInput).parameters.toEqualTypeOf<[Scope]>()
    expectTypeOf(form.getInput(scope)).toEqualTypeOf<InputSchema>()
  })

  it("matches setter type for setInput(setter)", () => {
    expectTypeOf(form.setInput).toEqualTypeOf<(setter: InputSetter) => void>()
  })

  it("ensures the branches type keys following the active output", () => {
    const form_1 = ImpulseFormSwitch(ImpulseFormUnit("_1" as const), branches)
    const form_2 = ImpulseFormSwitch(
      ImpulseFormUnit("_5" as const),
      // @ts-expect-error - active must be a union of branch keys
      branches,
    )

    expectTypeOf(form_1.branches).toHaveProperty("_1")
    expectTypeOf(form_2.branches).not.toHaveProperty("_1")
    expectTypeOf(form_2.branches).toHaveProperty("_5")
  })
})

it("initiates with children input", ({ scope }) => {
  const form = ImpulseFormSwitch(ImpulseFormUnit("_1" as const), {
    _1: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    _2: ImpulseFormShape({
      _3: ImpulseFormUnit("name"),
      _4: ImpulseFormUnit(18),
    }),
  })

  expect(form.getInput(scope)).toStrictEqual({
    active: "_1",
    branches: {
      _1: true,
      _2: {
        _3: "name",
        _4: 18,
      },
    },
  })
})

it("initiates with overridden input", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    },
    {
      input: {
        active: "_5",
        branches: {
          _1: false,
          _2: {
            _3: "overridden",
            _4: 20,
          },
        },
      },
    },
  )

  expect(form.getInput(scope)).toStrictEqual({
    active: "_5",
    branches: {
      _1: false,
      _2: {
        _3: "overridden",
        _4: 20,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "",
    branches: {
      _1: true,
      _2: {
        _3: "name",
        _4: 18,
      },
    },
  })
})

it("passes input and initial to setter", ({ scope }) => {
  expect.assertions(16)

  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    },
    {
      input: (input, initial) => {
        expect(input).toStrictEqual({
          active: "",
          branches: {
            _1: true,
            _2: {
              _3: "name",
              _4: 18,
            },
          },
        })
        expect(initial).toStrictEqual({
          active: "",
          branches: {
            _1: true,
            _2: {
              _3: "name",
              _4: 18,
            },
          },
        })

        return {
          active: (input_active, initial_active) => {
            expect(input_active).toBe("")
            expect(initial_active).toBe("")

            return "_1"
          },

          branches: (input_branches, initial_branches) => {
            expect(input_branches).toStrictEqual({
              _1: true,
              _2: {
                _3: "name",
                _4: 18,
              },
            })
            expect(initial_branches).toStrictEqual({
              _1: true,
              _2: {
                _3: "name",
                _4: 18,
              },
            })

            return {
              _1: (input_1, initial_1) => {
                expect(input_1).toBe(true)
                expect(initial_1).toBe(true)

                return false
              },

              _2: (input_2, initial_2) => {
                expect(input_2).toStrictEqual({
                  _3: "name",
                  _4: 18,
                })
                expect(initial_2).toStrictEqual({
                  _3: "name",
                  _4: 18,
                })

                return {
                  _3: (input_3, initial_3) => {
                    expect(input_3).toBe("name")
                    expect(initial_3).toBe("name")

                    return "updated"
                  },

                  _4: (input_4, initial_4) => {
                    expect(input_4).toBe(18)
                    expect(initial_4).toBe(18)

                    return 30
                  },
                }
              },
            }
          },
        }
      },
    },
  )

  expect(form.getInput(scope)).toStrictEqual({
    active: "_1",
    branches: {
      _1: false,
      _2: {
        _3: "updated",
        _4: 30,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "",
    branches: {
      _1: true,
      _2: {
        _3: "name",
        _4: 18,
      },
    },
  })
})

it("sets input", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    },
  )

  form.setInput({
    active: "_6",
    branches: {
      _1: false,
      _2: {
        _3: "updated",
        _4: 25,
      },
    },
  })

  expect(form.getInput(scope)).toStrictEqual({
    active: "_6",
    branches: {
      _1: false,
      _2: {
        _3: "updated",
        _4: 25,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "",
    branches: {
      _1: true,
      _2: {
        _3: "name",
        _4: 18,
      },
    },
  })
})

it("sets partial input", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    },
  )

  form.setInput({
    branches: {
      _2: {
        _4: 25,
      },
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
    active: "",
    branches: {
      _1: true,
      _2: {
        _3: "name",
        _4: 25,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "",
    branches: {
      _1: true,
      _2: {
        _3: "name",
        _4: 18,
      },
    },
  })

  form.setInput({
    active: "_7",
  })
  expect(form.getInput(scope)).toStrictEqual({
    active: "_7",
    branches: {
      _1: true,
      _2: {
        _3: "name",
        _4: 25,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "",
    branches: {
      _1: true,
      _2: {
        _3: "name",
        _4: 18,
      },
    },
  })
})

it("sets input with setter", ({ scope }) => {
  expect.assertions(16)

  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    },
  )

  form.setInput((input, initial) => {
    expect(input).toStrictEqual({
      active: "",
      branches: {
        _1: true,
        _2: {
          _3: "name",
          _4: 18,
        },
      },
    })
    expect(initial).toStrictEqual({
      active: "",
      branches: {
        _1: true,
        _2: {
          _3: "name",
          _4: 18,
        },
      },
    })

    return {
      active: (input_active, initial_active) => {
        expect(input_active).toBe("")
        expect(initial_active).toBe("")

        return "_1"
      },

      branches: (input_branches, initial_branches) => {
        expect(input_branches).toStrictEqual({
          _1: true,
          _2: {
            _3: "name",
            _4: 18,
          },
        })
        expect(initial_branches).toStrictEqual({
          _1: true,
          _2: {
            _3: "name",
            _4: 18,
          },
        })

        return {
          _1: (input_1, initial_1) => {
            expect(input_1).toBe(true)
            expect(initial_1).toBe(true)

            return false
          },

          _2: (input_2, initial_2) => {
            expect(input_2).toStrictEqual({
              _3: "name",
              _4: 18,
            })
            expect(initial_2).toStrictEqual({
              _3: "name",
              _4: 18,
            })

            return {
              _3: (input_3, initial_3) => {
                expect(input_3).toBe("name")
                expect(initial_3).toBe("name")

                return "updated"
              },

              _4: (input_4, initial_4) => {
                expect(input_4).toBe(18)
                expect(initial_4).toBe(18)

                return 30
              },
            }
          },
        }
      },
    }
  })

  expect(form.getInput(scope)).toStrictEqual({
    active: "_1",
    branches: {
      _1: false,
      _2: {
        _3: "updated",
        _4: 30,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "",
    branches: {
      _1: true,
      _2: {
        _3: "name",
        _4: 18,
      },
    },
  })
})
