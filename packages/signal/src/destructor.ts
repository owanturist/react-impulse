declare const UNDEFINED_VOID_ONLY: unique symbol

/**
 * @version 1.0.0
 */
// biome-ignore lint/suspicious/noConfusingVoidType: void is expected type of Destructor
type Destructor = void | (() => void | { [UNDEFINED_VOID_ONLY]: never })

export type { Destructor }
