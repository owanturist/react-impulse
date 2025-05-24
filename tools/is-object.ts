import { isDefined } from "~/is-defined"

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && isDefined(value)
}
