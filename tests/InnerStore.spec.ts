import { InnerStore } from "../src/InnerStore"

describe("InnerStore", () => {
  it("test", () => {
    const store = InnerStore.of(0)

    expect(store.getState()).toBe(0)

    store.setState(1)
    expect(store.getState()).toBe(1)
  })
})
