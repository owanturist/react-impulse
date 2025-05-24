export type ValidateStrategy = "onTouch" | "onChange" | "onSubmit" | "onInit"

export const VALIDATE_ON_TOUCH = "onTouch" satisfies ValidateStrategy
export const VALIDATE_ON_CHANGE = "onChange" satisfies ValidateStrategy
export const VALIDATE_ON_SUBMIT = "onSubmit" satisfies ValidateStrategy
export const VALIDATE_ON_INIT = "onInit" satisfies ValidateStrategy
