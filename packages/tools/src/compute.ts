type Compute<Obj> = unknown & {
  [K in keyof Obj]: Obj[K]
}

export type { Compute }
