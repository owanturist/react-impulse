import { isDefined } from "~/tools/is-defined"

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && isDefined(value)
}

export { isObject }
