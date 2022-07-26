import { DateTime, Interval } from 'luxon'

import type { Timer } from '../models'

export function getTimeDifferenceFromNow(timer: Timer): number {
  const now = DateTime.now().toUTC()
  const timerExecutionTime = DateTime.fromISO(timer.time)

  const difference = Interval.fromDateTimes(now, timerExecutionTime)

  return Math.round(difference.length('seconds')) || 0
}
