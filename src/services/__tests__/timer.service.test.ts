import { pino } from 'pino'

import type { TimerDao } from '../../dao/timer.dao'
import {NotFoundError} from '../../errors/notFound.error'
import type { Timer } from '../../models'
import { TimerService } from '../timer.service'

const upsertMock = jest.fn()
const getByIdMock = jest.fn()

const TimerDaoMock = {
  upsert: upsertMock,
  getById: getByIdMock,
} as unknown as TimerDao

describe('timer.service', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  describe('upsertTimer', () => {
    it('should successfully call timer dao upsert', async () => {
      upsertMock.mockResolvedValue(true)
      const context = {
        correlationId: 'corr-id',
        logger: pino(),
      }
      const timerService = new TimerService(TimerDaoMock)

      const upsertedStatus = await timerService.upsertTimer(
        context,
        {
          hours: '4',
          minutes: '0',
          seconds: '1',
          url: 'https://someserver.com'
        } as unknown as Timer)

      expect(upsertedStatus).toBe(true)
      expect(upsertMock).toBeCalledWith({hours: '4', minutes: '0', seconds: '1', url: 'https://someserver.com'})
    })

    it('should unsuccessfully call timer dao upsert', async () => {
      upsertMock.mockResolvedValue(false)
      const context = {
        correlationId: 'corr-id',
        logger: pino(),
      }
      const timerService = new TimerService(TimerDaoMock)

      const upsertedStatus = await timerService.upsertTimer(
        context,
        {
          hours: '4',
          minutes: '0',
          seconds: '1',
          url: 'https://someserver.com'
        } as unknown as Timer)

      expect(upsertedStatus).toBe(false)
      expect(upsertMock).toBeCalledWith({hours: '4', minutes: '0', seconds: '1', url: 'https://someserver.com'})
    })
  })

  describe('getTimerById', () => {
    it('should successfully call timer dao getTimerById', async () => {
      const mockTimer = {
        hours: '4',
        minutes: '0',
        seconds: '1',
        url: 'https://someserver.com'
      } as unknown as Timer

      getByIdMock.mockResolvedValue(mockTimer)
      const context = {
        correlationId: 'corr-id',
        logger: pino(),
      }
      const timerService = new TimerService(TimerDaoMock)

      const timer = await timerService.getTimerById(
        context,
        {
          id: 'some-id',
        } as unknown as Timer)

      expect(timer).toBe(mockTimer)
      expect(getByIdMock).toBeCalledWith('some-id')
    })

    it('should unsuccessfully call timer dao getTimerById', async () => {
      getByIdMock.mockRejectedValue(new NotFoundError('cannot find id'))
      const context = {
        correlationId: 'corr-id',
        logger: pino(),
      }
      const timerService = new TimerService(TimerDaoMock)

      const timer = await timerService.getTimerById(
        context,
        {
          id: 'some-id',
        } as unknown as Timer
      )

      expect(timer).toBe(undefined)
      expect(getByIdMock).toBeCalledWith('some-id')
    })
  })
})
