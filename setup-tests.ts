const spy_Object$is = vi.spyOn(Object, "is")

beforeEach(() => {
  spy_Object$is.mockClear()
})

vi.doMock("@testing-library/react", async () => {
  const actual = await vi.importActual("@testing-library/react")

  try {
    const { renderHook } = await vi.importActual<{
      renderHook: (typeof actual)["renderHook"]
    }>("@testing-library/react-hooks")

    return { ...actual, renderHook }
  } catch {
    return actual
  }
})
