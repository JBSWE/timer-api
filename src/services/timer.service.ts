import type { SqsPublisher } from '../AWS/sqsPublisher'
import type { TimerDao } from '../dao/timer.dao'
import type { Timer, TimerContext } from '../models'
import { Command } from '../models'
import { getTimeDifferenceFromNow } from '../utils/time.util'

export class TimerService {
  constructor(private timerDao: TimerDao, private sqsPublisher: SqsPublisher) {}

  async upsertTimer(timerContext: TimerContext, timer: Timer): Promise<boolean> {
      timerContext.logger.info(`Upserting timer: ${timer.id}`)
      return (await this.timerDao.upsert(timer)) as boolean
  }

  async getTimerById(timerContext: TimerContext, timerId: string): Promise<Timer | undefined> {
    try {
      timerContext.logger.info(`Getting timer for id: ${timerId}`)
      return await this.timerDao.getById(timerId)
    } catch(NotFoundError) {
      timerContext.logger.warn(`There is no content resource with the id: ${timerId}`)
      return undefined
    }
  }

  async fillSqsWithOutstandingTimers(referenceDate: string, timerContext: TimerContext) : Promise<void[]> {
  const outstandingTimers = await this.timerDao.getOutstandingTimers(referenceDate)
    timerContext.logger.info('Filling sqs with outstanding timers')
    return Promise.all(
      outstandingTimers.map(async (timer) => {
        const updatedTimer = {
          id: timer.id,
          url: timer.url,
          processed: 'true',
          time: timer.time
        }
        await this.timerDao.upsert(updatedTimer) && await this.sqsPublisher.publish(timerContext, Command.APPLY, updatedTimer, getTimeDifferenceFromNow(timer))
      }))
}

}
