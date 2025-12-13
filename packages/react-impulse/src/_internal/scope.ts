import type { MonitorEmitter } from "./scope-emitter"

const MONITOR_KEY = Symbol("monitor")

interface Monitor {
  readonly [MONITOR_KEY]: null | MonitorEmitter
}

const UNTRACKED_MONITOR = {
  [MONITOR_KEY]: null,
} satisfies Monitor

function createMonitor(emitter: MonitorEmitter): Monitor {
  return {
    [MONITOR_KEY]: emitter,
  }
}

function attachToMonitor(monitor: Monitor, emitters: Set<WeakRef<MonitorEmitter>>): void {
  monitor[MONITOR_KEY]?._attachTo(emitters)
}

let implicitMonitor: Monitor = UNTRACKED_MONITOR

function injectMonitor<TResult>(
  execute: (_monitor: Monitor) => TResult,
  monitor: Monitor,
): TResult {
  const prevMonitor = implicitMonitor

  implicitMonitor = monitor
  const result = execute(monitor)
  implicitMonitor = prevMonitor

  return result
}

function extractMonitor(): Monitor {
  return implicitMonitor
}

export type { Monitor }
export { UNTRACKED_MONITOR, createMonitor, attachToMonitor, injectMonitor, extractMonitor }
