export {
  WATCH_CALLING_IMPULSE_SET_VALUE,
  SUBSCRIBE_CALLING_IMPULSE_OF,
  SUBSCRIBE_CALLING_IMPULSE_TRANSMIT,
  SUBSCRIBE_CALLING_IMPULSE_CLONE,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_OF,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_TRANSMIT,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_CLONE,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_SET_VALUE,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_OF,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_TRANSMIT,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_CLONE,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_SET_VALUE,
}

/* c8 ignore start */

const WATCH_CALLING_IMPULSE_SET_VALUE =
  process.env.NODE_ENV === "production"
    ? ""
    : "You should not call Impulse#setValue during rendering of watch(Component)."

const SUBSCRIBE_CALLING_IMPULSE_OF =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse.of inside of the subscribe listener.",
        "The listener is for read-only operations but Impulse.of creates a new Impulse.",
      ].join(" ")
const SUBSCRIBE_CALLING_IMPULSE_TRANSMIT =
  process.env.NODE_ENV === "production"
    ? ""
    : SUBSCRIBE_CALLING_IMPULSE_OF.replaceAll("Impulse.of", "Impulse.transmit")
const SUBSCRIBE_CALLING_IMPULSE_CLONE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse#clone inside of the subscribe listener.",
        "The listener is for read-only operations but Impulse#clone clones an existing Impulse.",
      ].join(" ")

const USE_WATCH_IMPULSE_CALLING_IMPULSE_OF =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse.of inside of the useWatchImpulse watcher.",
        "The useWatchImpulse hook is for read-only operations but Impulse.of creates a new Impulse.",
      ].join(" ")
const USE_WATCH_IMPULSE_CALLING_IMPULSE_TRANSMIT =
  process.env.NODE_ENV === "production"
    ? ""
    : USE_WATCH_IMPULSE_CALLING_IMPULSE_OF.replaceAll(
        "Impulse.of",
        "Impulse.transmit",
      )
const USE_WATCH_IMPULSE_CALLING_IMPULSE_CLONE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse#clone inside of the useWatchImpulse watcher.",
        "The useWatchImpulse hook is for read-only operations but Impulse#clone clones an existing Impulse.",
      ].join(" ")
const USE_WATCH_IMPULSE_CALLING_IMPULSE_SET_VALUE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse#setValue inside of the useWatchImpulse watcher.",
        "The useWatchImpulse hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
      ].join(" ")

const USE_IMPULSE_MEMO_CALLING_IMPULSE_OF =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse.of inside of the useImpulseMemo factory.",
        "The useImpulseMemo hook is for read-only operations but Impulse.of creates a new Impulse.",
      ].join(" ")
const USE_IMPULSE_MEMO_CALLING_IMPULSE_TRANSMIT =
  process.env.NODE_ENV === "production"
    ? ""
    : USE_IMPULSE_MEMO_CALLING_IMPULSE_OF.replaceAll(
        "Impulse.of",
        "Impulse.transmit",
      )
const USE_IMPULSE_MEMO_CALLING_IMPULSE_CLONE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse#clone inside of the useImpulseMemo factory.",
        "The useImpulseMemo hook is for read-only operations but Impulse#clone clones an existing Impulse.",
      ].join(" ")
const USE_IMPULSE_MEMO_CALLING_IMPULSE_SET_VALUE =
  process.env.NODE_ENV === "production"
    ? ""
    : [
        "You should not call Impulse#setValue inside of the useImpulseMemo factory.",
        "The useImpulseMemo hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
      ].join(" ")

/* c8 ignore stop */
