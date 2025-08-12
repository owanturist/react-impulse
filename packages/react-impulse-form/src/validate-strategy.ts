export type ValidateStrategy = "onTouch" | "onChange" | "onSubmit" | "onInit"

export const VALIDATE_ON_TOUCH = "onTouch" as const satisfies ValidateStrategy
export const VALIDATE_ON_CHANGE = "onChange" as const satisfies ValidateStrategy
export const VALIDATE_ON_SUBMIT = "onSubmit" as const satisfies ValidateStrategy
export const VALIDATE_ON_INIT = "onInit" as const satisfies ValidateStrategy
