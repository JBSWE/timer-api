import { pino } from 'pino'

import type { SqsPublisher } from '../../AWS/sqsPublisher'
import type { TimerDao } from '../../dao/timer.dao'
import { NotFoundError } from '../../errors/notFound.error'
import { TimerService } from '../timer.service'

const upsertMock = jest.fn()
const getByIdMock = jest.fn()
const getOutstandingTimersMock = jest.fn()

const timerDaoMock = {
  upsert: upsertMock,
  getById: getByIdMock,
  getOutstandingTimers:getOutstandingTimersMock
} as unknown as TimerDao

const publishSqsMock = jest.fn()
const SqsPublisherMock = {
  publish: publishSqsMock
} as unknown as SqsPublisher

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
      const timerService = new TimerService(timerDaoMock, SqsPublisherMock)
      const timer = {
        id: 'some-id',
        time: '2022-07-22T23:53:31.218Z',
        url: 'https://someserver.com',
        processed: 'false'
      }

      const upsertedStatus = await timerService.upsertTimer(context, timer)

      expect(upsertedStatus).toBe(true)
      expect(upsertMock).toBeCalledWith(timer)
    })

    it('should unsuccessfully call timer dao upsert', async () => {
      upsertMock.mockResolvedValue(false)
      const context = {
        correlationId: 'corr-id',
        logger: pino(),
      }
      const timerService = new TimerService(timerDaoMock, SqsPublisherMock)
      const timer = {
        id: 'some-id',
        time: '2022-07-22T23:53:31.218Z',
        url: 'https://someserver.com',
        processed: 'false'
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
      const timerService = new TimerService(timerDaoMock, SqsPublisherMock)

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
      const timerService = new TimerService(timerDaoMock, SqsPublisherMock)

      const timer = await timerService.getTimerById(context, mockTimer.id)

      expect(timer).toBe(undefined)
      expect(getByIdMock).toBeCalledWith('some-id')
    })
  })

  describe('fillSqsWithOutstandingTimers', () => {
    it('should successfully call timer dao getTimerById', async () => {
      const timeDaoResponse = [{
        id: 'some-id-1',
        time: '2022-07-22T23:53:31.218Z',
        url: 'https://someserver.com',
        processed: false
      },
        {
          id: 'some-id-2',
          time: '2022-07-22T23:55:31.218Z',
          url: 'https://someserver.com',
          processed: false
        }]
      upsertMock.mockResolvedValue(true)
      publishSqsMock.mockReturnValue(true)
      getOutstandingTimersMock.mockReturnValue(timeDaoResponse)

      const context = {
        correlationId: 'corr-id',
        logger: pino(),
      }
      const timerService = new TimerService(timerDaoMock, SqsPublisherMock)

      await timerService.fillSqsWithOutstandingTimers('2022-05-22T23:50:31.218Z', context)

      expect(upsertMock).toHaveBeenNthCalledWith(1,
        {
          id: 'some-id-1',
          time: '2022-07-22T23:53:31.218Z',
          url: 'https://someserver.com',
          processed: 'true'
        })
      expect(upsertMock).toHaveBeenNthCalledWith(2,
        {
          id: 'some-id-2',
          time: '2022-07-22T23:55:31.218Z',
          url: 'https://someserver.com',
          processed: 'true'
        })
      expect(publishSqsMock).toBeCalledTimes(2)
    })

    it('should not publish to queue if upsert fails', async () => {
      const timeDaoResponse = [{
        id: 'some-id-1',
        time: '2022-07-22T23:53:31.218Z',
        url: 'https://someserver.com',
        processed: false
      }]
      upsertMock.mockRejectedValue(Error())
      getOutstandingTimersMock.mockReturnValue(timeDaoResponse)

      const context = {
        correlationId: 'corr-id',
        logger: pino(),
      }
      const timerService = new TimerService(timerDaoMock, SqsPublisherMock)

      await expect(timerService.fillSqsWithOutstandingTimers('2022-05-22T23:50:31.218Z', context)).rejects.toThrowError()

      expect(publishSqsMock).toBeCalledTimes(0)
    })
  })
})
