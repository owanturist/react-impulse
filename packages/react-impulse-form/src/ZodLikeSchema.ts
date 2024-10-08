import { isArray, isInstanceOf, isObject, isString, type Result } from "./utils"

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

  const errors =
    "errors" in result.error ? result.error.errors : result.error.issues

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

  if (isInstanceOf(error, Error)) {
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
