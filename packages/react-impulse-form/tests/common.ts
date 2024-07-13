export async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

// rename to param
export const arg =
  <TIndex extends number>(index: TIndex) =>
  <TArgs extends ReadonlyArray<unknown>>(...args: TArgs): TArgs[TIndex] =>
    args[index]
