import type { Schema, ZodPipeline, ZodTypeDef } from "zod"

export type ImpulseFormSchema<TOutput, TInput = TOutput> =
  | Schema<TOutput, ZodTypeDef, TInput>
  | ZodPipeline<Schema<TInput>, Schema<TOutput>>

export type Result<TError, TData> =
  | { success: false; error: TError }
  | { success: true; data: TData }
