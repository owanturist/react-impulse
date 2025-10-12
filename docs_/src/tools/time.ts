export type Time = number | Date

export function getTime(time: Time): number
export function getTime(time: undefined | Time): undefined | number
export function getTime(time: undefined | Time): undefined | number {
  return time instanceof Date ? time.getTime() : time
}
