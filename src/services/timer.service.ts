import type { TimerDao } from '../dao/timer.dao'
import type { Timer, TimerContext } from '../models'

export class TimerService {
  constructor(private timerDao: TimerDao) {
  }

  async upsertTimer(timerContext: TimerContext, timer: Timer): Promise<boolean> {
      timerContext.logger.info(`Upserting timer: ${timer.id}`)
      return (await this.timerDao.upsert(timer)) as boolean
  }

  async getTimerById(timerContext: TimerContext, timer: Timer): Promise<Timer | undefined> {
    const TimerId = timer.id
    try {
      timerContext.logger.info(`getting timer for id: ${TimerId}`)
      return await this.timerDao.getById(TimerId)
    } catch(NotFoundError) {
      timerContext.logger.warn(`There is no content resource with the id: ${TimerId}`)
      return undefined
    }
  }

}
