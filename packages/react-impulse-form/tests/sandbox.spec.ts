import { Impulse, type Scope, batch, untrack } from "react-impulse"
import { drop } from "~/tools/drop"

import { forEntries } from "~/tools/for-entries"
import { isUndefined } from "~/tools/is-undefined"
import { map } from "~/tools/map"
import { mapValues } from "~/tools/map-values"
import { map2 } from "~/tools/map2"
import { take } from "~/tools/take"
import { replaceElement } from "~/tools/replace-element"

interface Params {
  initial: unknown

  "input.schema": unknown
}

type GetBlockParams<TBlock> =
  TBlock extends Block<infer TParams> ? TParams : never

abstract class Block<TParams extends Params> {
  protected readonly _params?: TParams

  public readonly root: Block<Params>

  public constructor(
    parent: null | Block<Params>,
    private readonly initial: Impulse<TParams["initial"]>,
  ) {
    this.root = parent?.root ?? (this as unknown as Block<Params>)
  }

  public abstract _childOf(
    parent: Block<Params>,
    initial: Impulse<TParams["initial"]>,
  ): Block<TParams>

  public abstract _resolveInitial(
    state: TParams["initial"],
    value: TParams["input.schema"],
  ): void

  public abstract _extractInitial(
    scope: Scope,
    state: TParams["initial"],
  ): TParams["input.schema"]

  // TODO Is it needed
  public _getInitial(scope: Scope): TParams["initial"] {
    return this.initial.getValue(scope)
  }

  public _setInitial(initial: TParams["initial"]): void {
    this.initial.setValue(initial)
  }

  public getInitial(scope: Scope): TParams["input.schema"] {
    return this._extractInitial(scope, this._getInitial(scope))
  }

  public setInitial(initial: TParams["input.schema"]): void {
    batch((scope) => {
      this._resolveInitial(this._getInitial(scope), initial)
    })
  }

  public abstract getInput(scope: Scope): TParams["input.schema"]
  public abstract setInput(input: TParams["input.schema"]): void
}

interface UnitInitial<T> {
  unit: Impulse<T>
}

interface UnitParams<T> extends Params {
  initial: UnitInitial<T>
  "input.schema": T
}

class Unit<T> extends Block<UnitParams<T>> {
  public static of<T>(input: T, { initial = input }: { initial?: T } = {}) {
    return new Unit(null, Impulse({ unit: Impulse(initial) }), Impulse(input))
  }

  private constructor(
    parent: null | Block<Params>,
    initial: Impulse<UnitInitial<T>>,
    private readonly input: Impulse<T>,
  ) {
    super(parent, initial)
  }

  public _childOf(
    parent: Block<Params>,
    initial: Impulse<UnitInitial<T>>,
  ): Unit<T> {
    return new Unit(parent, initial, this.input.clone())
  }

  public _resolveInitial(state: UnitInitial<T>, initial: T): void {
    state.unit.setValue(initial)
  }

  public _extractInitial(scope: Scope, state: UnitInitial<T>): T {
    return state.unit.getValue(scope)
  }

  public getInput(scope: Scope): T {
    return this.input.getValue(scope)
  }

  public setInput(input: T): void {
    this.input.setValue(input)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShapeFields = Record<string, Block<any>>

type ShapeInitial<TFields extends ShapeFields> = {
  readonly [K in keyof TFields]: GetBlockParams<TFields[K]>["initial"]
}

type ShapeInput<TFields extends ShapeFields> = {
  readonly [K in keyof TFields]: GetBlockParams<TFields[K]>["input.schema"]
}

interface ShapeParams<TFields extends ShapeFields> extends Params {
  initial: ShapeInitial<TFields>
  "input.schema": ShapeInput<TFields>
}

class Shape<TFields extends ShapeFields> extends Block<ShapeParams<TFields>> {
  public static of<TFields extends ShapeFields>(
    fields: TFields,
    options: {
      input?: ShapeInput<TFields>
      initial?: ShapeInput<TFields>
    } = {},
  ): Shape<TFields> {
    const initial = untrack((scope) => {
      return mapValues(fields, (field) => Impulse(field._getInitial(scope)))
    })

    const shape = new Shape(null, Impulse(initial), fields)

    if (!isUndefined(options.input)) {
      shape.setInput(options.input)
    }

    if (!isUndefined(options.initial)) {
      shape.setInitial(options.initial)
    }

    return shape
  }

  public readonly fields: Readonly<TFields>

  private constructor(
    parent: null | Block<Params>,
    initial: Impulse<ShapeInitial<TFields>>,
    fields: Readonly<TFields>,
  ) {
    super(parent, initial)

    this.fields = mapValues(fields, (field, key) => {
      return field._childOf(this, untrack(initial)[key])
    })
  }

  public _childOf(
    parent: Block<Params>,
    initial: Impulse<ShapeInitial<TFields>>,
  ): Shape<TFields> {
    return new Shape(parent, initial, this.fields)
  }

  public _resolveInitial(
    state: ShapeInitial<TFields>,
    input: ShapeInput<TFields>,
  ): void {
    batch(() => {
      forEntries(this.fields, (field, key) => {
        field._resolveInitial(untrack(state[key]), input[key])
      })
    })
  }

  public _extractInitial(
    scope: Scope,
    state: ShapeInitial<TFields>,
  ): ShapeInput<TFields> {
    return mapValues(this.fields, (field, key) =>
      field._extractInitial(scope, state[key].getValue(scope)),
    )
  }

  public getInput(scope: Scope): ShapeInput<TFields> {
    return mapValues(this.fields, (field) => field.getInput(scope))
  }

  public setInput(input: ShapeInput<TFields>): void {
    batch(() => {
      forEntries(this.fields, (field, key) => {
        field.setInput(input[key])
      })
    })
  }
}

interface ListInitial<TElement extends Block<any>> {
  list: Impulse<ReadonlyArray<GetBlockParams<TElement>["initial"]>>
}

type ListInput<TElement extends Block<any>> = ReadonlyArray<
  GetBlockParams<TElement>["input.schema"]
>

interface ListParams<TElement extends Block<any>> extends Params {
  initial: ListInitial<TElement>
  "input.schema": ListInput<TElement>
}

class List<TElement extends Block<any>> extends Block<ListParams<TElement>> {
  public static of<TElement extends Block<any>>(
    elements: ReadonlyArray<TElement>,
    options: {
      input?: ListInput<TElement>
      initial?: ListInput<TElement>
    } = {},
  ): List<TElement> {
    const initial = untrack((scope) => {
      return map(elements, (element) => Impulse(element._getInitial(scope)))
    })

    const list = new List(null, Impulse({ list: Impulse(initial) }), elements)

    if (!isUndefined(options.input)) {
      list.setInput(options.input)
    }

    if (!isUndefined(options.initial)) {
      list.setInitial(options.initial)
    }

    return list
  }

  private readonly _initialElements: Impulse<ReadonlyArray<TElement>>

  private readonly _elements: Impulse<ReadonlyArray<TElement>>

  private constructor(
    parent: null | Block<Params>,
    initial: Impulse<ListInitial<TElement>>,
    elements: ReadonlyArray<TElement>,
  ) {
    super(parent, initial)

    this._elements = Impulse(
      map(elements, (element, index) => {
        return element._childOf(
          this,
          untrack((scope) => initial.getValue(scope).list.getValue(scope))[
            index
          ]!,
        )
      }),
    )

    this._initialElements = Impulse(elements)
  }

  public _childOf(
    parent: Block<Params>,
    initial: Impulse<ListInitial<TElement>>,
  ): List<TElement> {
    return new List(parent, initial, untrack(this._elements))
  }

  public _resolveInitial(
    state: ListInitial<TElement>,
    value: ListInput<TElement>,
  ): void {
    batch((scope) => {
      const initialElements = this._initialElements.getValue(scope)
      const elements = this._elements.getValue(scope)
      const combinedElements = [
        ...initialElements,
        ...drop(elements, initialElements.length),
      ]

      const nextList = map2(
        combinedElements,
        value,
        (element, elementInitial) => {
          const next = element._getInitial(scope)
          element._resolveInitial(next, elementInitial)

          return Impulse(next)
        },
      )

      state.list.setValue(nextList)
      this._initialElements.setValue(take(combinedElements, value.length))

      elements.forEach((element, index) => {
        element._setInitial(nextList[index])
      })
    })
  }

  public _extractInitial(
    scope: Scope,
    state: ListInitial<TElement>,
  ): ListInput<TElement> {
    return map2(
      this._initialElements.getValue(scope),
      state.list.getValue(scope),
      (element, initial) =>
        element._extractInitial(scope, initial.getValue(scope)),
    )
  }

  public getElements(scope: Scope): ReadonlyArray<TElement> {
    return this._elements.getValue(scope)
  }

  public setElements(elements: ReadonlyArray<TElement>): void {}

  public getInput(scope: Scope): ListInput<TElement> {
    return map(this._elements.getValue(scope), (element) =>
      element.getInput(scope),
    )
  }

  public setInput(input: ListInput<TElement>): void {
    this._elements.setValue((elements) => {
      return map2(elements, input, (element, value) => {
        element.setInput(value)

        return element
      })
    })
  }
}

describe("Unit", () => {
  it("follows the type definition", () => {
    const unit = Unit.of(42)

    expectTypeOf(unit.getInitial).returns.toEqualTypeOf<number>()
    expectTypeOf(unit.getInput).returns.toEqualTypeOf<number>()
  })

  it("default initial", ({ scope }) => {
    const unit = Unit.of(42)

    expect(unit.getInitial(scope)).toBe(42)
    expect(unit.getInput(scope)).toBe(42)

    unit.setInitial(100)

    expect(unit.getInitial(scope)).toBe(100)
    expect(unit.getInput(scope)).toBe(42)
  })

  it("custom initial", ({ scope }) => {
    const unit = Unit.of(42, { initial: 0 })

    expect(unit.getInitial(scope)).toBe(0)
    expect(unit.getInput(scope)).toBe(42)

    unit.setInitial(100)

    expect(unit.getInitial(scope)).toBe(100)
    expect(unit.getInput(scope)).toBe(42)
  })

  it("input", ({ scope }) => {
    const unit = Unit.of(42)

    expect(unit.getInput(scope)).toBe(42)
    expect(unit.getInitial(scope)).toBe(42)

    unit.setInput(100)

    expect(unit.getInput(scope)).toBe(100)
    expect(unit.getInitial(scope)).toBe(42)
  })
})

describe("Shape", () => {
  it("follows the type definition", () => {
    const shape = Shape.of({
      first: Shape.of({
        second: Unit.of(0),
      }),
      third: Unit.of(false),
    })

    expectTypeOf(shape.getInitial).returns.toEqualTypeOf<{
      readonly first: {
        readonly second: number
      }
      readonly third: boolean
    }>()

    expectTypeOf(shape.fields.first.getInitial).returns.toEqualTypeOf<{
      readonly second: number
    }>()
    expectTypeOf(
      shape.fields.first.fields.second.getInitial,
    ).returns.toBeNumber()
    expectTypeOf(shape.fields.third.getInitial).returns.toBeBoolean()

    expectTypeOf(shape.getInput).returns.toEqualTypeOf<{
      readonly first: {
        readonly second: number
      }
      readonly third: boolean
    }>()

    expectTypeOf(shape.fields.first.getInput).returns.toEqualTypeOf<{
      readonly second: number
    }>()
    expectTypeOf(shape.fields.first.fields.second.getInput).returns.toBeNumber()
    expectTypeOf(shape.fields.third.getInput).returns.toBeBoolean()
  })

  it("refers to the same root", () => {
    const shape = Shape.of({
      first: Shape.of({
        second: Unit.of(0),
      }),
      third: Unit.of([0]),
    })

    expect(shape.root).toBe(shape)
    expect(shape.fields.first.root).toBe(shape)
    expect(shape.fields.first.fields.second.root).toBe(shape)
    expect(shape.fields.third.root).toBe(shape)
  })

  it("default initial", ({ scope }) => {
    const shape = Shape.of({
      first: Shape.of({
        second: Unit.of(0),
      }),
      third: Unit.of(""),
    })

    expect(shape.getInitial(scope)).toStrictEqual({
      first: {
        second: 0,
      },
      third: "",
    })
  })

  it("default initial with custom input", ({ scope }) => {
    const shape = Shape.of(
      {
        first: Shape.of({
          second: Unit.of(0),
        }),
        third: Unit.of(""),
      },
      {
        input: {
          first: {
            second: 1,
          },
          third: "1",
        },
      },
    )

    expect(shape.getInitial(scope)).toStrictEqual({
      first: {
        second: 0,
      },
      third: "",
    })
    expect(shape.getInput(scope)).toStrictEqual({
      first: {
        second: 1,
      },
      third: "1",
    })
  })

  it("custom input and initial", ({ scope }) => {
    const shape = Shape.of(
      {
        first: Shape.of({
          second: Unit.of(0),
        }),
        third: Unit.of(""),
      },
      {
        input: {
          first: {
            second: 1,
          },
          third: "1",
        },
        initial: {
          first: {
            second: 2,
          },
          third: "2",
        },
      },
    )

    expect(shape.getInitial(scope)).toStrictEqual({
      first: {
        second: 2,
      },
      third: "2",
    })
    expect(shape.getInput(scope)).toStrictEqual({
      first: {
        second: 1,
      },
      third: "1",
    })
  })

  it("changes initial", ({ scope }) => {
    const shape = Shape.of({
      first: Shape.of({
        second: Unit.of(0),
      }),
      third: Unit.of(""),
    })

    shape.setInitial({
      first: {
        second: 100,
      },
      third: "101",
    })

    expect(shape.getInitial(scope)).toStrictEqual({
      first: {
        second: 100,
      },
      third: "101",
    })
    expect(shape.getInput(scope)).toStrictEqual({
      first: {
        second: 0,
      },
      third: "",
    })

    shape.fields.first.setInitial({
      second: 200,
    })
    expect(shape.getInitial(scope)).toStrictEqual({
      first: {
        second: 200,
      },
      third: "101",
    })

    shape.fields.first.fields.second.setInitial(201)
    expect(shape.getInitial(scope)).toStrictEqual({
      first: {
        second: 201,
      },
      third: "101",
    })

    shape.fields.third.setInitial("200")
    expect(shape.getInitial(scope)).toStrictEqual({
      first: {
        second: 201,
      },
      third: "200",
    })

    expect(shape.getInput(scope)).toStrictEqual({
      first: {
        second: 0,
      },
      third: "",
    })
  })

  it("changes input", ({ scope }) => {
    const shape = Shape.of({
      first: Shape.of({
        second: Unit.of(0),
      }),
      third: Unit.of(""),
    })

    shape.setInput({
      first: {
        second: 100,
      },
      third: "101",
    })

    expect(shape.getInput(scope)).toStrictEqual({
      first: {
        second: 100,
      },
      third: "101",
    })
    expect(shape.getInitial(scope)).toStrictEqual({
      first: {
        second: 0,
      },
      third: "",
    })

    shape.fields.first.setInput({
      second: 200,
    })
    expect(shape.getInput(scope)).toStrictEqual({
      first: {
        second: 200,
      },
      third: "101",
    })

    shape.fields.first.fields.second.setInput(201)
    expect(shape.getInput(scope)).toStrictEqual({
      first: {
        second: 201,
      },
      third: "101",
    })

    shape.fields.third.setInput("200")
    expect(shape.getInput(scope)).toStrictEqual({
      first: {
        second: 201,
      },
      third: "200",
    })

    expect(shape.getInitial(scope)).toStrictEqual({
      first: {
        second: 0,
      },
      third: "",
    })
  })
})

describe("List", () => {
  it("follows the type definition", ({ scope }) => {
    const list = List.of([
      List.of([
        //
        Unit.of(0),
      ]),
    ])

    expectTypeOf(list.getInitial).returns.toEqualTypeOf<
      ReadonlyArray<ReadonlyArray<number>>
    >()
    expectTypeOf(
      list.getElements(scope).at(0)!.getInitial,
    ).returns.toEqualTypeOf<ReadonlyArray<number>>()
    expectTypeOf(
      list.getElements(scope).at(0)!.getElements(scope).at(0)!.getInitial,
    ).returns.toBeNumber()

    expectTypeOf(list.getInput).returns.toEqualTypeOf<
      ReadonlyArray<ReadonlyArray<number>>
    >()
    expectTypeOf(list.getElements(scope).at(0)!.getInput).returns.toEqualTypeOf<
      ReadonlyArray<number>
    >()
    expectTypeOf(
      list.getElements(scope).at(0)!.getElements(scope).at(0)!.getInput,
    ).returns.toBeNumber()
  })

  it("refers to the same root", ({ scope }) => {
    const list = List.of([
      List.of([
        //
        Unit.of(0),
        Unit.of(1),
      ]),
    ])

    expect(list.root).toBe(list)
    expect(list.getElements(scope).at(0)!.root).toBe(list)
    expect(list.getElements(scope).at(0)!.getElements(scope).at(0)!.root).toBe(
      list,
    )
    expect(list.getElements(scope).at(0)!.getElements(scope).at(1)!.root).toBe(
      list,
    )
  })

  it("default initial", ({ scope }) => {
    const list = List.of([
      List.of([
        //
        Unit.of(0),
        Unit.of(1),
      ]),
    ])

    expect(list.getInitial(scope)).toStrictEqual([[0, 1]])
  })

  it("default initial with custom shorter input", ({ scope }) => {
    const list = List.of(
      [
        List.of([
          //
          Unit.of(0),
          Unit.of(1),
        ]),
      ],
      {
        input: [[1]],
      },
    )

    expect(list.getInitial(scope)).toStrictEqual([[0, 1]])
    expect(list.getInput(scope)).toStrictEqual([[1]])
  })

  it("default initial with custom longer input", ({ scope }) => {
    const list = List.of(
      [
        List.of([
          //
          Unit.of(0),
          Unit.of(1),
        ]),
      ],
      {
        input: [[1, 2, 3]],
      },
    )

    expect(list.getInitial(scope)).toStrictEqual([[0, 1]])
    expect(list.getInput(scope)).toStrictEqual([[1, 2]])
  })

  it("custom input and initial", ({ scope }) => {
    const list = List.of(
      [
        List.of([
          //
          Unit.of(0),
          Unit.of(1),
        ]),
      ],
      {
        input: [[20, 21, 22]],
        initial: [[10]],
      },
    )

    expect(list.getInitial(scope)).toStrictEqual([[10]])
    expect(list.getInput(scope)).toStrictEqual([[20, 21]])
  })

  describe("when updating initial value from different entry points", () => {
    it.skip("root level", ({ scope }) => {
      const form = List.of([List.of([Unit.of(1), Unit.of(2)])])

      form.setInitial([[10, 2]])

      expect(form.getInitial(scope)).toStrictEqual([[10, 2]])
      expect(
        form.getElements(scope).map((list) => list.getInitial(scope)),
      ).toStrictEqual([[10, 2]])
      expect(
        form
          .getElements(scope)
          .map((list) =>
            list.getElements(scope).map((unit) => unit.getInitial(scope)),
          ),
      ).toStrictEqual([[10, 2]])
    })

    it.skip("middle level", ({ scope }) => {
      const form = List.of([List.of([Unit.of(1), Unit.of(2)])])

      form.getElements(scope).at(0)!.setInitial([10, 2])

      expect(form.getInitial(scope)).toStrictEqual([[10, 2]])
      expect(
        form.getElements(scope).map((list) => list.getInitial(scope)),
      ).toStrictEqual([[10, 2]])
      expect(
        form
          .getElements(scope)
          .map((list) =>
            list.getElements(scope).map((unit) => unit.getInitial(scope)),
          ),
      ).toStrictEqual([[10, 2]])
    })

    it("bottom level", ({ scope }) => {
      const form = List.of([List.of([Unit.of(1), Unit.of(2)])])

      form.getElements(scope).at(0)!.getElements(scope).at(0)!.setInitial(10)

      expect(form.getInitial(scope)).toStrictEqual([[10, 2]])
      expect(
        form.getElements(scope).map((list) => list.getInitial(scope)),
      ).toStrictEqual([[10, 2]])
      expect(
        form
          .getElements(scope)
          .map((list) =>
            list.getElements(scope).map((unit) => unit.getInitial(scope)),
          ),
      ).toStrictEqual([[10, 2]])
    })
  })
})
