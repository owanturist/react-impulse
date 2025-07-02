export type Compute<Obj> = unknown & {
  [K in keyof Obj]: Obj[K]
}
