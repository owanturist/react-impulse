import type { Equal, Signal } from "@owanturist/signal"

import type { Counter } from "~/tools/testing/counter"

export interface WithSignal<T = Counter> {
  signal: Signal<T>
}

export interface WithEquals<T = Counter> {
  equals?: null | Equal<T>
}

export interface WithFirst<T = Counter> {
  first: Signal<T>
}

export interface WithSecond<T = Counter> {
  second: Signal<T>
}

export interface WithThird<T = Counter> {
  third: Signal<T>
}

export interface WithSpy {
  spy(...args: Array<unknown>): void
}

export interface WithListener {
  listener: VoidFunction
}

export interface WithIsActive {
  isActive: boolean
}
