export const WATCH_CALLING_IMPULSE_SET_VALUE =
  process.env.NODE_ENV === "production"
    ? ""
    : "You should not call Impulse#setValue during rendering of watch(Component)."

export const SUBSCRIBE_CALLING_IMPULSE_OF =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse.of inside of the subscribe listener.",
        "The listener is for read-only operations but Impulse.of creates a new Impulse.",
      ].join(" ")
export const SUBSCRIBE_CALLING_IMPULSE_TRANSMIT =
  process.env.NODE_ENV === "production"
    ? ""
    : SUBSCRIBE_CALLING_IMPULSE_OF.replaceAll("Impulse.of", "Impulse.transmit")
export const SUBSCRIBE_CALLING_IMPULSE_CLONE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse#clone inside of the subscribe listener.",
        "The listener is for read-only operations but Impulse#clone clones an existing Impulse.",
      ].join(" ")

export const USE_WATCH_IMPULSE_CALLING_IMPULSE_OF =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse.of inside of the useWatchImpulse watcher.",
        "The useWatchImpulse hook is for read-only operations but Impulse.of creates a new Impulse.",
      ].join(" ")
export const USE_WATCH_IMPULSE_CALLING_IMPULSE_TRANSMIT =
  process.env.NODE_ENV === "production"
    ? ""
    : USE_WATCH_IMPULSE_CALLING_IMPULSE_OF.replaceAll(
        "Impulse.of",
        "Impulse.transmit",
      )
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

export const USE_SCOPED_MEMO_CALLING_IMPULSE_OF =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse.of inside of the useScopedMemo factory.",
        "The useScopedMemo hook is for read-only operations but Impulse.of creates a new Impulse.",
      ].join(" ")
export const USE_SCOPED_MEMO_CALLING_IMPULSE_TRANSMIT =
  process.env.NODE_ENV === "production"
    ? ""
    : USE_SCOPED_MEMO_CALLING_IMPULSE_OF.replaceAll(
        "Impulse.of",
        "Impulse.transmit",
      )
export const USE_SCOPED_MEMO_CALLING_IMPULSE_CLONE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse#clone inside of the useScopedMemo factory.",
        "The useScopedMemo hook is for read-only operations but Impulse#clone clones an existing Impulse.",
      ].join(" ")
export const USE_SCOPED_MEMO_CALLING_IMPULSE_SET_VALUE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse#setValue inside of the useScopedMemo factory.",
        "The useScopedMemo hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
      ].join(" ")
