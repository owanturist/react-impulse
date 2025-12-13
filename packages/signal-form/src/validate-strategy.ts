type ValidateStrategy = "onTouch" | "onChange" | "onSubmit" | "onInit"

const VALIDATE_ON_TOUCH = "onTouch" as const satisfies ValidateStrategy
const VALIDATE_ON_CHANGE = "onChange" as const satisfies ValidateStrategy
const VALIDATE_ON_SUBMIT = "onSubmit" as const satisfies ValidateStrategy
const VALIDATE_ON_INIT = "onInit" as const satisfies ValidateStrategy

export type { ValidateStrategy }
export { VALIDATE_ON_TOUCH, VALIDATE_ON_CHANGE, VALIDATE_ON_SUBMIT, VALIDATE_ON_INIT }
