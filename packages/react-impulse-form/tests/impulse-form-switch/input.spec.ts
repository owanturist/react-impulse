import type { Scope } from "react-impulse"
import z from "zod"

import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormShape,
  ImpulseFormSwitch,
  type ImpulseFormSwitchInputSetter,
  type ImpulseFormSwitchOptions,
  ImpulseFormUnit,
} from "../../src"

describe("bounding active output with branches keys", () => {
  it("ensures the branches type keys following the active output", () => {
    const form_1 = ImpulseFormSwitch(ImpulseFormUnit<"_1">("_1"), {
      _1: ImpulseFormUnit(0),
    })
    expectTypeOf(form_1.branches).toHaveProperty("_1")

    const form_2 = ImpulseFormSwitch(ImpulseFormUnit("_2" as const), {
      // @ts-expect-error - active must be a union of branch keys
      _0: ImpulseFormUnit(0),
    })
    expectTypeOf(form_2.branches).not.toHaveProperty("_0")
    expectTypeOf(form_2.branches).toHaveProperty("_2")

    const form_3 = ImpulseFormSwitch(
      ImpulseFormUnit("_2"),
      // @ts-expect-error active is a `string`
      {
        _0: ImpulseFormUnit(0),
      },
    )
    expectTypeOf(form_3.branches).toHaveProperty("_0")
    expectTypeOf(form_3.branches).not.toHaveProperty("_2")
  })

  it("ensures the active output is a string", () => {
    const form_1 = ImpulseFormSwitch(
      ImpulseFormUnit(1),
      // @ts-expect-error should be never
      {
        _1: ImpulseFormUnit(0),
      },
    )
    expectTypeOf(form_1.branches).toBeNever()

    const form_2 = ImpulseFormSwitch(
      ImpulseFormUnit("", {
        schema: z.number(),
      }),
      // @ts-expect-error should be never
      {
        _1: ImpulseFormUnit(0),
      },
    )
    expectTypeOf(form_2.branches).toBeNever()
  })

  it("ensures all output variants are present in branches", () => {
    const form_1 = ImpulseFormSwitch(
      ImpulseFormUnit("", {
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(0),
        _2: ImpulseFormUnit(1),
      },
    )
    expectTypeOf(form_1.branches).toHaveProperty("_1")
    expectTypeOf(form_1.branches).toHaveProperty("_2")

    const form_2 = ImpulseFormSwitch(
      ImpulseFormUnit("", {
        schema: z.enum(["_1", "_2"]),
      }),
      // @ts-expect-error - missing _2 branch
      {
        _1: ImpulseFormUnit(0),
      },
    )
    expectTypeOf(form_2.branches).toHaveProperty("_1")
    expectTypeOf(form_2.branches).toHaveProperty("_2")

    const form_3 = ImpulseFormSwitch(
      ImpulseFormUnit(""),
      // @ts-expect-error missing `string` branches
      {
        _1: ImpulseFormUnit(0),
        _2: ImpulseFormUnit(2),
      },
    )
    expectTypeOf(form_3.branches).toHaveProperty("_1")
    expectTypeOf(form_3.branches).toHaveProperty("_2")
  })
})

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

  it("matches schema type for getInput(scope)", () => {
    expectTypeOf(form.getInput).toEqualTypeOf<(scope: Scope) => InputSchema>()
  })

  it("matches setter type for setInput(setter)", () => {
    expectTypeOf(form.setInput).toEqualTypeOf<(setter: InputSetter) => void>()
  })

  it("ensures ImpulseFormSwitchOptions.input type", () => {
    const form = ImpulseFormSwitch(active, branches, {
      input: {
        // @ts-expect-error should be a string
        active: 1,
        branches: {
          // @ts-expect-error should be a number
          _1: 0,
          _2: {
            // @ts-expect-error should be a string
            _3: false,
            // @ts-expect-error should be a number
            _4: "",
          },
        },
      },
    })

    expectTypeOf(form).not.toBeUndefined()
  })

  describe("nested", () => {
    const parent = ImpulseFormSwitch(ImpulseFormUnit<"_6" | "_7">("_6"), {
      _6: ImpulseFormUnit(0),
      _7: form,
    })

    interface ParentInputSchema {
      readonly active: "_6" | "_7"
      readonly branches: {
        readonly _6: number
        readonly _7: InputSchema
      }
    }

    type ParentInputSetter = Setter<
      {
        readonly active?: Setter<"_6" | "_7", ["_6" | "_7", "_6" | "_7"]>
        readonly branches?: Setter<
          {
            readonly _6?: Setter<number, [number, number]>
            readonly _7?: InputSetter
          },
          [ParentInputSchema["branches"], ParentInputSchema["branches"]]
        >
      },
      [ParentInputSchema, ParentInputSchema]
    >

    it("matches schema type for getInput(scope)", () => {
      expectTypeOf(parent.getInput).toEqualTypeOf<
        (scope: Scope) => ParentInputSchema
      >()
    })

    it("matches setter type for setInput(setter)", () => {
      expectTypeOf(parent.setInput).toEqualTypeOf<
        (setter: ParentInputSetter) => void
      >()
    })
  })
})

it("initiates with children input", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("_1", {
      schema: z.enum(["_1", "_2", "_5"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
      _5: ImpulseFormSwitch(ImpulseFormUnit<"_6" | "_7">("_6"), {
        _6: ImpulseFormUnit(0),
        _7: ImpulseFormUnit("0"),
      }),
    },
  )

  expect(form.getInput(scope)).toStrictEqual({
    active: "_1",
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
})

it("initiates with overridden input", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["_1", "_2", "_5"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
      _5: ImpulseFormSwitch(ImpulseFormUnit<"_6" | "_7">("_6"), {
        _6: ImpulseFormUnit(0),
        _7: ImpulseFormUnit("0"),
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
          _5: {
            active: "_7",
            branches: {
              _6: 1,
              _7: "1",
            },
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
      _5: {
        active: "_7",
        branches: {
          _6: 1,
          _7: "1",
        },
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

describe("using recursive setter", () => {
  const active = ImpulseFormUnit("", {
    schema: z.enum(["_1", "_2", "_5"]),
  })

  const branches = {
    _1: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    _2: ImpulseFormShape({
      _3: ImpulseFormUnit("name"),
      _4: ImpulseFormUnit(18),
    }),
    _5: ImpulseFormSwitch(ImpulseFormUnit<"_6" | "_7">("_6"), {
      _6: ImpulseFormUnit(0),
      _7: ImpulseFormUnit("0"),
    }),
  }

  function setup(
    options?: ImpulseFormSwitchOptions<typeof active, typeof branches>,
  ) {
    return ImpulseFormSwitch(active, branches, options)
  }

  describe.each<
    [
      string,
      (
        input: ImpulseFormSwitchInputSetter<typeof active, typeof branches>,
      ) => ImpulseFormSwitch<typeof active, typeof branches>,
    ]
  >([
    [
      "ImpulseFormSwitchOptions.input",
      (input) => {
        return setup({ input })
      },
    ],

    [
      "ImpulseFormSwitch.setInput",
      (setter) => {
        const form = setup()

        form.setInput(setter)

        return form
      },
    ],
  ])("in %s", (_, setup) => {
    it("passes initial and input recursively to all setters", ({ scope }) => {
      expect.assertions(26)

      const form = setup((input, initial) => {
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
        expect(initial).toStrictEqual({
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
              _5: {
                active: "_6",
                branches: {
                  _6: 0,
                  _7: "0",
                },
              },
            })
            expect(initial_branches).toStrictEqual({
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

              _5: (input_5, initial_5) => {
                expect(input_5).toStrictEqual({
                  active: "_6",
                  branches: {
                    _6: 0,
                    _7: "0",
                  },
                })
                expect(initial_5).toStrictEqual({
                  active: "_6",
                  branches: {
                    _6: 0,
                    _7: "0",
                  },
                })

                return {
                  active: (input_active, initial_active) => {
                    expect(input_active).toBe("_6")
                    expect(initial_active).toBe("_6")

                    return "_7"
                  },

                  branches: (input_branches, initial_branches) => {
                    expect(input_branches).toStrictEqual({
                      _6: 0,
                      _7: "0",
                    })
                    expect(initial_branches).toStrictEqual({
                      _6: 0,
                      _7: "0",
                    })

                    return {
                      _6: (input_6, initial_6) => {
                        expect(input_6).toBe(0)
                        expect(initial_6).toBe(0)

                        return 3
                      },

                      _7: (input_7, initial_7) => {
                        expect(input_7).toBe("0")
                        expect(initial_7).toBe("0")

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

      expect(form.getInput(scope)).toStrictEqual({
        active: "_1",
        branches: {
          _1: false,
          _2: {
            _3: "updated",
            _4: 30,
          },
          _5: {
            active: "_7",
            branches: {
              _6: 3,
              _7: "3",
            },
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
  })
})

describe("stable input value", () => {
  it("subsequently selects equal input", ({ scope }) => {
    const form = ImpulseFormSwitch(ImpulseFormUnit<"_1" | "_2" | "_5">("_1"), {
      _1: ImpulseFormUnit(true),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
      _5: ImpulseFormSwitch(
        ImpulseFormUnit("_6", {
          schema: z.enum(["_6", "_7"]),
        }),
        {
          _6: ImpulseFormUnit(0),
          _7: ImpulseFormUnit("0"),
        },
      ),
    })

    expect(form.getInput(scope)).toBe(form.getInput(scope))
  })

  it("persists unchanged branches input between changes", ({ scope }) => {
    const form = ImpulseFormSwitch(ImpulseFormUnit<"_1" | "_2" | "_5">("_1"), {
      _1: ImpulseFormUnit(true),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
      _5: ImpulseFormSwitch(
        ImpulseFormUnit("_6", {
          schema: z.enum(["_6", "_7"]),
        }),
        {
          _6: ImpulseFormUnit(0),
          _7: ImpulseFormUnit("0"),
        },
      ),
    })

    const input_0 = form.getInput(scope)

    form.setInput({
      branches: {
        _2: {
          _3: "updated",
        },
      },
    })

    const input_1 = form.getInput(scope)

    expect(input_1).not.toBe(input_0)
    expect(input_1.active).toBe(input_0.active)
    expect(input_1.branches).not.toBe(input_0.branches)
    expect(input_1.branches._2).not.toBe(input_0.branches._2)
    expect(input_1.branches._5).toBe(input_0.branches._5)
  })

  it("selects unequal input values when isInputEqual is not specified", ({
    scope,
  }) => {
    const form = ImpulseFormSwitch(ImpulseFormUnit<"_1">("_1"), {
      _1: ImpulseFormUnit([0]),
    })

    const input_0 = form.getInput(scope)

    form.setInput({
      branches: {
        _1: [0],
      },
    })
    const input_1 = form.getInput(scope)

    expect(input_0).not.toBe(input_1)
    expect(input_0).toStrictEqual(input_1)
  })

  it("selects equal input values when isInputEqual is specified", ({
    scope,
  }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("", {
        schema: z.enum(["_1"]),
      }),
      {
        _1: ImpulseFormUnit([0], {
          isInputEqual: isShallowArrayEqual,
        }),
      },
    )

    const input_0 = form.getInput(scope)

    form.setInput({
      branches: {
        _1: [0],
      },
    })
    const input_1 = form.getInput(scope)

    expect(input_0).toBe(input_1)
    expect(input_0).toStrictEqual(input_1)
  })
})
