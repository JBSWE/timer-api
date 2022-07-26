import { DateTime } from 'luxon'

import { SqsPublisher } from '../AWS/sqsPublisher'
import type { ProcessEnv } from '../config'
import { getString } from '../config'
import { TimerDao } from '../dao/timer.dao'
import type { LambdaRequestContext, LambdaRequestEvent } from '../models'
import { TimerService } from '../services/timer.service'
import { createContextForScheduleHandler } from '../utils/createContext.util'
import { getSqsUrl } from '../utils/offline.util'

const sqsPublisher = new SqsPublisher(getSqsUrl())
const timerDao = new TimerDao(getString('DYNAMODB_TABLE' as ProcessEnv))
const timerService = new TimerService(timerDao, sqsPublisher)

export async function scheduleOutstandingTimers(
  event: LambdaRequestEvent,
  context: LambdaRequestContext
): Promise<void> {
  const timerContext = createContextForScheduleHandler(context)
  const referenceDate = DateTime.now().plus({ minutes: 15 }).setZone('utc').toISO()
  timerContext.logger.info(`Scheduling outstanding timers to SQS: ${referenceDate}`)
  try {
    await timerService.fillSqsWithOutstandingTimers(referenceDate, timerContext)
  } catch (e) {
    timerContext.logger.warn(e, `Error scheduling for referenceDate: ${referenceDate}.`)
  }
}
