/* c8 ignore start */
export const WATCH_CALLING_IMPULSE_SET_VALUE =
  process.env.NODE_ENV === "production"
    ? ""
    : "You should not call Impulse#setValue during rendering of watch(Component)."
export const WATCH_CALLING_IMPULSE_SUBSCRIBE =
  process.env.NODE_ENV === "production"
    ? ""
    : "You may not call Impulse#subscribe during rendering of watch(Component)."

export const SUBSCRIBE_CALLING_IMPULSE_OF =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse.of inside of the subscribe listener.",
        "The listener is for read-only operations but Impulse.of creates a new Impulse.",
      ].join(" ")
export const SUBSCRIBE_CALLING_IMPULSE_CLONE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse#clone inside of the subscribe listener.",
        "The listener is for read-only operations but Impulse#clone clones an existing Impulse.",
      ].join(" ")
export const SUBSCRIBE_CALLING_IMPULSE_SUBSCRIBE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You may not call Impulse#subscribe inside of the subscribe listener.",
        "The listener is for read-only operations but Impulse#subscribe subscribes to an Impulse.",
      ].join(" ")

export const USE_WATCH_IMPULSE_CALLING_IMPULSE_OF =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse.of inside of the useWatchImpulse watcher.",
        "The useWatchImpulse hook is for read-only operations but Impulse.of creates a new Impulse.",
      ].join(" ")
export const USE_WATCH_IMPULSE_CALLING_IMPULSE_CLONE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse#clone inside of the useWatchImpulse watcher.",
        "The useWatchImpulse hook is for read-only operations but Impulse#clone clones an existing Impulse.",
      ].join(" ")
export const USE_WATCH_IMPULSE_CALLING_IMPULSE_SET_VALUE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse#setValue inside of the useWatchImpulse watcher.",
        "The useWatchImpulse hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
      ].join(" ")
export const USE_WATCH_IMPULSE_CALLING_IMPULSE_SUBSCRIBE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You may not call Impulse#subscribe inside of the useWatchImpulse watcher.",
        "The useWatchImpulse hook is for read-only operations but Impulse#subscribe subscribes to an Impulse.",
      ].join(" ")

export const USE_IMPULSE_MEMO_CALLING_IMPULSE_OF =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse.of inside of the useImpulseMemo factory.",
        "The useImpulseMemo hook is for read-only operations but Impulse.of creates a new Impulse.",
      ].join(" ")
export const USE_IMPULSE_MEMO_CALLING_IMPULSE_CLONE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse#clone inside of the useImpulseMemo factory.",
        "The useImpulseMemo hook is for read-only operations but Impulse#clone clones an existing Impulse.",
      ].join(" ")
export const USE_IMPULSE_MEMO_CALLING_IMPULSE_SET_VALUE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse#setValue inside of the useImpulseMemo factory.",
        "The useImpulseMemo hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
      ].join(" ")
export const USE_IMPULSE_MEMO_CALLING_IMPULSE_SUBSCRIBE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You may not call Impulse#subscribe inside of the useImpulseMemo factory.",
        "The useImpulseMemo hook is for read-only operations but Impulse#subscribe subscribes to an Impulse.",
      ].join(" ")
/* c8 ignore stop */
