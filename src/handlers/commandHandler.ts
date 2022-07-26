import type { SQSEvent } from 'aws-lambda'
import axios from 'axios'

import { SqsPublisher } from '../AWS/sqsPublisher'
import type { ProcessEnv } from '../config'
import { getString } from '../config'
import { TimerDao } from '../dao/timer.dao'
import type { LambdaRequestContext, SqsRequest, Timer, TimerContext } from '../models'
import { Command } from '../models'
import { TimerService } from '../services/timer.service'
import { createContextForSqsEvent } from '../utils/createContext.util'
import { getSqsUrl } from '../utils/offline.util'
import { getTimeDifferenceFromNow } from '../utils/time.util'

const timerDao = new TimerDao(getString('DYNAMODB_TABLE' as ProcessEnv))
const sqsPublisher = new SqsPublisher(getSqsUrl())
const timerService = new TimerService(timerDao)

export async function processCommand(event: SQSEvent, context: LambdaRequestContext): Promise<void> {
  const timerContext = createContextForSqsEvent(event, context)

  const { command, timer } = extractSqsEventDetails(event)

  const timerUrl = `${timer.url}/${timer.id}`
  const timeDifferenceFromNow = getTimeDifferenceFromNow(timer)

  switch (command) {
    case Command.APPLY:
      timerContext.logger.info(`APPLY command for Timer ${timer.id}`)
      await postUrl(timerUrl, timerContext)
      break
    case Command.UPSERT:
      timerContext.logger.info(`UPSERT command for Timer ${timer.id}`)
      await processUpsert(timeDifferenceFromNow, timer, timerService, timerContext)
      break
    default:
      timerContext.logger.info('There was no assigned command')
      break
  }
}

function extractSqsEventDetails(event: SQSEvent): { command: Command | undefined, timer: Timer } {
  const record = event.Records[0]
  const message = JSON.parse(record.body) as SqsRequest

  const command = message.meta?.command
  const timer = message.data as Timer

  return { command, timer }
}

async function processUpsert(timeDifferenceFromNow: number, timer: Timer, service: TimerService, timerContext: TimerContext): Promise<void> {
  const FIFTEEN_MINUTES = 900
  if (timeDifferenceFromNow <= FIFTEEN_MINUTES) {
    const updatedTimer = {
      id: timer.id,
      time: timer.time,
      url: timer.url,
      processed: 'true'
    }
    await Promise.all([
      timerService.upsertTimer(timerContext, updatedTimer),
      sqsPublisher.publish(timerContext, Command.APPLY, updatedTimer, timeDifferenceFromNow)
    ])
  } else {
    await timerService.upsertTimer(timerContext, timer)
  }
}

async function postUrl(url: string, timerContext: TimerContext): Promise<void> {
  try {
    await axios.post(url)
    timerContext.logger.info(`Post has successfully been called for url ${url}`)
  } catch (e) {
    const error = e as Error
    timerContext.logger.warn(`Cannot post to url: ${url}`, error.message)
  }
}
