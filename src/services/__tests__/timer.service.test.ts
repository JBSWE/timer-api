import { pino } from 'pino'

import type { TimerDao } from '../../dao/timer.dao'
import {NotFoundError} from '../../errors/notFound.error'
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
      const timer = {
        id: 'some-id',
        time: '2022-07-22T23:53:31.218Z',
        url: 'https://someserver.com',
        processed: false
      }

      const upsertedStatus = await timerService.upsertTimer(context,timer)

      expect(upsertedStatus).toBe(true)
      expect(upsertMock).toBeCalledWith(timer)
    })

    it('should unsuccessfully call timer dao upsert', async () => {
      upsertMock.mockResolvedValue(false)
      const context = {
        correlationId: 'corr-id',
        logger: pino(),
      }
      const timerService = new TimerService(TimerDaoMock)
      const timer = {
        id: 'some-id',
        time: '2022-07-22T23:53:31.218Z',
        url: 'https://someserver.com',
        processed: false
      }

      const upsertedStatus = await timerService.upsertTimer(context, timer)

      expect(upsertedStatus).toBe(false)
      expect(upsertMock).toBeCalledWith(timer)
    })
  })

  describe('getTimerById', () => {
    it('should successfully call timer dao getTimerById', async () => {
      const mockTimer = {
        id: 'some-id',
        time: '2022-07-22T23:53:31.218Z',
        url: 'https://someserver.com',
        processed: false
      }

      getByIdMock.mockResolvedValue(mockTimer)
      const context = {
        correlationId: 'corr-id',
        logger: pino(),
      }
      const timerService = new TimerService(TimerDaoMock)

      const timer = await timerService.getTimerById(context, mockTimer.id)

      expect(timer).toBe(mockTimer)
      expect(getByIdMock).toBeCalledWith('some-id')
    })

    it('should unsuccessfully call timer dao getTimerById', async () => {
      const mockTimer = {
        id: 'some-id',
        time: '2022-07-22T23:53:31.218Z',
        url: 'https://someserver.com',
        processed: false
      }
      getByIdMock.mockRejectedValue(new NotFoundError('cannot find id'))
      const context = {
        correlationId: 'corr-id',
        logger: pino(),
      }
      const timerService = new TimerService(TimerDaoMock)

      const timer = await timerService.getTimerById(context, mockTimer.id)

      expect(timer).toBe(undefined)
      expect(getByIdMock).toBeCalledWith('some-id')
    })
  })
})
