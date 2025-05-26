import { hasProperty } from "~/tools/has-property"
import { isArray } from "~/tools/is-array"
import { isObject } from "~/tools/is-object"
import { isString } from "~/tools/is-string"

import type { Result } from "./result"

export interface ZodLikeIssue {
  message: string
}

export type ZodLikeError =
  | { get errors(): ReadonlyArray<ZodLikeIssue> }
  | { errors: ReadonlyArray<ZodLikeIssue> }
  | { issues: ReadonlyArray<ZodLikeIssue> }

export type ZodLikeSafeParseResult<TOutput> =
  | { success: false; error: ZodLikeError }
  | { success: true; data: TOutput }

export type ZodLikeSchema<TOutput> =
  | { parse(input: unknown): TOutput }
  | { safeParse(input: unknown): ZodLikeSafeParseResult<TOutput> }

function zodLikeSafeParseResultToResult<TOutput>(
  result: ZodLikeSafeParseResult<TOutput>,
): Result<ReadonlyArray<string>, TOutput> {
  if (result.success) {
    return [null, result.data]
  }

  const errors = hasProperty(result.error, "errors")
    ? result.error.errors
    : result.error.issues

  return [errors.map(({ message }) => message), null]
}

function unknownErrors(error: unknown): ReadonlyArray<string> {
  if (!isObject(error)) {
    return []
  }

  const errors = error.errors ?? error.issues

  if (isArray(errors)) {
    return errors
      .filter(isObject)
      .map(({ message }) => message)
      .filter(isString)
  }

  if (error instanceof Error) {
    return [error.message]
  }

  return []
}

export function zodLikeParse<TOutput>(
  schema: ZodLikeSchema<TOutput>,
  input: unknown,
): Result<ReadonlyArray<string>, TOutput> {
  if ("safeParse" in schema) {
    return zodLikeSafeParseResultToResult(schema.safeParse(input))
  }

  try {
    return [null, schema.parse(input)]
  } catch (error) {
    return [unknownErrors(error), null]
  }
}
