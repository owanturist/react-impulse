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

  interface InitialSchema {
    readonly active: string
    readonly branches: {
      readonly _1: boolean
      readonly _2: {
        readonly _3: string
        readonly _4: number
      }
    }
  }

  type InitialSetter = Setter<
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
            [InitialSchema["branches"]["_2"], InitialSchema["branches"]["_2"]]
          >
        },
        [InitialSchema["branches"], InitialSchema["branches"]]
      >
    },
    [InitialSchema, InitialSchema]
  >

  it("matches setter type for ImpulseFormSwitchOptions.initial", () => {
    expectTypeOf<typeof ImpulseFormSwitch<typeof active, typeof branches>>()
      .parameter(2)
      .exclude<undefined>()
      .toHaveProperty("initial")
      .toEqualTypeOf<undefined | InitialSetter>()
  })

  it("matches schema type for getInitial(scope)", ({ scope }) => {
    expectTypeOf(form.getInitial).parameters.toEqualTypeOf<[Scope]>()
    expectTypeOf(form.getInitial(scope)).toEqualTypeOf<InitialSchema>()
  })

  it("matches setter type for setInitial(setter)", () => {
    expectTypeOf(form.setInitial).toEqualTypeOf<
      (setter: InitialSetter) => void
    >()
  })
})

it("initiates with children input", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("_1", {
      initial: "_2",
    }),
    {
      _1: ImpulseFormUnit(true, {
        initial: false,
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18, {
          initial: 20,
        }),
      }),
    },
  )

  expect(form.getInitial(scope)).toStrictEqual({
    active: "_2",
    branches: {
      _1: false,
      _2: {
        _3: "name",
        _4: 20,
      },
    },
  })
})

it("initiates with overridden initial", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      initial: "_5",
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        initial: false,
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18, {
          initial: 20,
        }),
      }),
    },
    {
      initial: {
        active: "_6",
        branches: {
          _1: true,
          _2: {
            _3: "overridden",
            _4: 100,
          },
        },
      },
    },
  )

  expect(form.getInitial(scope)).toStrictEqual({
    active: "_6",
    branches: {
      _1: true,
      _2: {
        _3: "overridden",
        _4: 100,
      },
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
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
      initial: "_7",
    }),
    {
      _1: ImpulseFormUnit(true, {
        initial: false,
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape(
        {
          _3: ImpulseFormUnit("name", {
            initial: "initial",
          }),
          _4: ImpulseFormUnit(18),
        },
        {
          initial: {
            _4: 100,
          },
        },
      ),
    },
    {
      initial: (initial, input) => {
        expect(initial).toStrictEqual({
          active: "_7",
          branches: {
            _1: false,
            _2: {
              _3: "initial",
              _4: 100,
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
          },
        })

        return {
          active: (initial_active, input_active) => {
            expect(initial_active).toBe("_7")
            expect(input_active).toBe("")

            return "_1"
          },

          branches: (initial_branches, input_branches) => {
            expect(initial_branches).toStrictEqual({
              _1: false,
              _2: {
                _3: "initial",
                _4: 100,
              },
            })
            expect(input_branches).toStrictEqual({
              _1: true,
              _2: {
                _3: "name",
                _4: 18,
              },
            })

            return {
              _1: (initial_1, input_1) => {
                expect(initial_1).toBe(false)
                expect(input_1).toBe(true)

                return true
              },

              _2: (initial_2, input_2) => {
                expect(initial_2).toStrictEqual({
                  _3: "initial",
                  _4: 100,
                })
                expect(input_2).toStrictEqual({
                  _3: "name",
                  _4: 18,
                })

                return {
                  _3: (initial_3, input_3) => {
                    expect(initial_3).toBe("initial")
                    expect(input_3).toBe("name")

                    return "updated"
                  },

                  _4: (initial_4, input_4) => {
                    expect(initial_4).toBe(100)
                    expect(input_4).toBe(18)

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

  expect(form.getInitial(scope)).toStrictEqual({
    active: "_1",
    branches: {
      _1: true,
      _2: {
        _3: "updated",
        _4: 30,
      },
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
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

it("sets initial", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      initial: "_8",
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

  form.setInitial({
    active: "_9",
    branches: {
      _1: false,
      _2: {
        _3: "updated",
        _4: 25,
      },
    },
  })

  expect(form.getInitial(scope)).toStrictEqual({
    active: "_9",
    branches: {
      _1: false,
      _2: {
        _3: "updated",
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
        _4: 18,
      },
    },
  })
})

it("sets partial initial", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      initial: "_10",
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name", {
          initial: "initial",
        }),
        _4: ImpulseFormUnit(18),
      }),
    },
  )

  form.setInitial({
    branches: {
      _2: {
        _4: 25,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "_10",
    branches: {
      _1: true,
      _2: {
        _3: "initial",
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
        _4: 18,
      },
    },
  })

  form.setInitial({
    active: "_11",
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "_11",
    branches: {
      _1: true,
      _2: {
        _3: "initial",
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
        _4: 18,
      },
    },
  })
})

it("sets initial with setter", ({ scope }) => {
  expect.assertions(16)

  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["_1", "_2"]),
      initial: "_12",
    }),
    {
      _1: ImpulseFormUnit(true, {
        initial: false,
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape(
        {
          _3: ImpulseFormUnit("name", {
            initial: "initial",
          }),
          _4: ImpulseFormUnit(18),
        },
        {
          initial: {
            _4: 100,
          },
        },
      ),
    },
  )

  form.setInitial((initial, input) => {
    expect(initial).toStrictEqual({
      active: "_12",
      branches: {
        _1: false,
        _2: {
          _3: "initial",
          _4: 100,
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
      },
    })

    return {
      active: (initial_active, input_active) => {
        expect(initial_active).toBe("_12")
        expect(input_active).toBe("")

        return "_1"
      },

      branches: (initial_branches, input_branches) => {
        expect(initial_branches).toStrictEqual({
          _1: false,
          _2: {
            _3: "initial",
            _4: 100,
          },
        })
        expect(input_branches).toStrictEqual({
          _1: true,
          _2: {
            _3: "name",
            _4: 18,
          },
        })

        return {
          _1: (initial_1, input_1) => {
            expect(initial_1).toBe(false)
            expect(input_1).toBe(true)

            return true
          },

          _2: (initial_2, input_2) => {
            expect(initial_2).toStrictEqual({
              _3: "initial",
              _4: 100,
            })
            expect(input_2).toStrictEqual({
              _3: "name",
              _4: 18,
            })

            return {
              _3: (initial_3, input_3) => {
                expect(initial_3).toBe("initial")
                expect(input_3).toBe("name")

                return "updated"
              },

              _4: (initial_4, input_4) => {
                expect(initial_4).toBe(100)
                expect(input_4).toBe(18)

                return 30
              },
            }
          },
        }
      },
    }
  })

  expect(form.getInitial(scope)).toStrictEqual({
    active: "_1",
    branches: {
      _1: true,
      _2: {
        _3: "updated",
        _4: 30,
      },
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
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
