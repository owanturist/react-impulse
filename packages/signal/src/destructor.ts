declare const UNDEFINED_VOID_ONLY: unique symbol

// biome-ignore lint/suspicious/noConfusingVoidType: void is expected type of Destructor
type Destructor = void | (() => void | { [UNDEFINED_VOID_ONLY]: never })

export type { Destructor }
