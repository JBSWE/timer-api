import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

import type { Timer,TimerHttpPost } from '../models'

export function timerBuilder(input: TimerHttpPost): Timer | undefined {
  const { hours, minutes, seconds, url } = input

  if(!hours || !minutes || !seconds || !url) {
    return undefined
  }

  return {
    id: uuidv4(),
    time: DateTime.now().plus({
      hours: Number(hours),
      minutes: Number(minutes),
      seconds: Number(seconds)
    }).setZone('UTC').toISO(),
    url,
    processed: 'false'
  }

}
