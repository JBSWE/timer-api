import type { TimerDao } from '../dao/timer.dao'
import type { Timer, TimerContext } from '../models'

export class TimerService {
  constructor(private timerDao: TimerDao) {
  }

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

}
