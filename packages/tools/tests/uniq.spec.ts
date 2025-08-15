import { uniq } from "../src/uniq"

it("should return the same array when all elements are unique", () => {
  const input = [1, 2, 3, 4, 5]
  const result = uniq(input)

  expect(result).toStrictEqual([1, 2, 3, 4, 5])
  expect(result).toBe(input)
})

it("should remove duplicate numbers", () => {
  const input = [1, 2, 2, 3, 1, 4, 3, 5]
  const result = uniq(input)

  expect(result).toStrictEqual([1, 2, 3, 4, 5])
  expect(result).not.toBe(input)
})

it("should remove duplicate strings", () => {
  const input = ["a", "b", "b", "c", "a", "d"]
  const result = uniq(input)

  expect(result).toStrictEqual(["a", "b", "c", "d"])
})

it("should handle empty array", () => {
  const input: Array<number> = []
  const result = uniq(input)

  expect(result).toStrictEqual([])
  expect(result).toBe(input)
})

it("should handle array with single element", () => {
  const input = [42]
  const result = uniq(input)

  expect(result).toStrictEqual([42])
  expect(result).toBe(input)
})

it("should handle array with all identical elements", () => {
  const input = [1, 1, 1, 1]
  const result = uniq(input)

  expect(result).toStrictEqual([1])
  expect(result).not.toBe(input)
})

it("should preserve order of first occurrence", () => {
  const input = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
  const result = uniq(input)

  expect(result).toStrictEqual([3, 1, 4, 5, 9, 2, 6])
})

it("should work with objects (reference equality)", () => {
  const obj1 = { id: 1 }
  const obj2 = { id: 2 }
  const obj3 = { id: 1 } // Different reference, same content
  const input = [obj1, obj2, obj1, obj3, obj2]
  const result = uniq(input)

  expect(result).toStrictEqual([obj1, obj2, obj3])
})

it("should work with mixed types", () => {
  const input = [1, "1", 1, "1", true, 1, "hello", true]
  const result = uniq(input)

  expect(result).toStrictEqual([1, "1", true, "hello"])
})

it("should work with boolean values", () => {
  const input = [true, false, true, false, true]
  const result = uniq(input)

  expect(result).toStrictEqual([true, false])
})

it("should work with null and undefined", () => {
  const input = [null, undefined, null, 1, undefined, null]
  const result = uniq(input)

  expect(result).toStrictEqual([null, undefined, 1])
})

it("should handle large arrays efficiently", () => {
  const input = Array.from({ length: 10000 }, (_, i) => i % 100)
  const result = uniq(input)

  expect(result).toHaveLength(100)
  expect(result).toStrictEqual(Array.from({ length: 100 }, (_, i) => i))
})

it("should output readonly array type", () => {
  const input = [1, 2, 2, 3]
  const result = uniq(input)

  expectTypeOf(result).toEqualTypeOf<ReadonlyArray<number>>()
})
