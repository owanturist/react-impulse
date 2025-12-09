import { hasProperty } from "~/tools/has-property"
import { isArray } from "~/tools/is-array"
import { isObject } from "~/tools/is-object"
import { isString } from "~/tools/is-string"
import { map } from "~/tools/map"

import type { Result } from "../../result"

interface ZodLikeIssue {
  message: string
}

type ZodLikeError =
  | { get errors(): ReadonlyArray<ZodLikeIssue> }
  | { errors: ReadonlyArray<ZodLikeIssue> }
  | { issues: ReadonlyArray<ZodLikeIssue> }

type ZodLikeSafeParseResult<TOutput> =
  | { success: false; error: ZodLikeError }
  | { success: true; data: TOutput }

type ZodLikeSchema<TOutput> =
  | { parse(input: unknown): TOutput }
  | { safeParse(input: unknown): ZodLikeSafeParseResult<TOutput> }

function zodLikeSafeParseResultToResult<TOutput>(
  result: ZodLikeSafeParseResult<TOutput>,
): Result<ReadonlyArray<string>, TOutput> {
  if (result.success) {
    return [null, result.data]
  }

  const errors = hasProperty(result.error, "errors") ? result.error.errors : result.error.issues

  return [map(errors, ({ message }) => message), null]
}

function unknownErrors(error: unknown): ReadonlyArray<string> {
  if (!isObject(error)) {
    return []
  }

  const errors = error.errors ?? error.issues

  if (isArray(errors)) {
    return map(errors.filter(isObject), ({ message }) => message).filter(isString)
  }

  if (error instanceof Error) {
    return [error.message]
  }

  return []
}

function zodLikeParse<TOutput>(
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

export type { ZodLikeIssue, ZodLikeError, ZodLikeSafeParseResult, ZodLikeSchema }
export { zodLikeParse }
