const publishSqsMock = jest.fn()
jest.mock('../../AWS/sqsPublisher.ts', () => {
  return {
    SqsPublisher: jest.fn().mockImplementation(() => {
      return {
        publish: publishSqsMock,
      }
    }),
  }
})

const upsertTimerMock = jest.fn()
jest.mock('../../services/timer.service', () => {
  return {
    TimerService: jest.fn().mockImplementation(() => {
      return {
        upsertTimer: upsertTimerMock,
      }
    }),
  }
})

import { getTimeDifferenceFromNow } from '../../utils/time.util'

jest.mock('../../utils/time.util')
const getTimeDifferenceFromNowMock = getTimeDifferenceFromNow as jest.MockedFunction<typeof getTimeDifferenceFromNow>

import type { SQSEvent } from 'aws-lambda'
import mockAxios from 'jest-mock-axios'

import type { LambdaRequestContext } from '../../models'
import { processCommand } from '../commandHandler'

describe('commandHandler', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  const context = {
    awsRequestId: 'TimerHandlerTest',
  } as LambdaRequestContext

  function createApplySQSEvent(): SQSEvent {
    return {
      Records: [
        {
          body: JSON.stringify({
            data: {
              id: 'some-id',
              time: '2022-07-22T23:53:31.218Z',
              url: 'some-url',
              processed: false
            },
            meta: {
              correlationId: 'timer-api-0b026b20-074c-491e-b12d-bdbc258e7a74',
              command: 'APPLY',
            },
          }),
        },
      ],
    } as SQSEvent
  }

  function createUpsertSQSEvent(): SQSEvent {
    return {
      Records: [
        {
          body: JSON.stringify({
            data: {
              id: 'some-id',
              time: '2022-07-22T23:53:31.218Z',
              url: 'some-url',
              processed: false
            },
            meta: {
              correlationId: 'timer-api-0b026b20-074c-491e-b12d-bdbc258e7a74',
              command: 'UPSERT',
            },
          }),
        },
      ],
    } as SQSEvent
  }

  describe('processCommand', () => {
    afterEach(() => {
      jest.resetAllMocks()
    })
    it('command APPLY sends post request containing specified URL with the id appended', async () => {
      const event = createApplySQSEvent()

      await processCommand(event, context)

      expect(mockAxios.post).toHaveBeenCalledWith('some-url/some-id')
      expect(upsertTimerMock).toBeCalledTimes(0)
      expect(publishSqsMock).toBeCalledTimes(0)
    })

    it('command APPLY handles axios post errors', async () => {
      mockAxios.post.mockRejectedValue(Error())
      const event = createApplySQSEvent()

      await expect(processCommand(event, context)).resolves

      expect(mockAxios.post).toHaveBeenCalledWith('some-url/some-id')
      expect(upsertTimerMock).toBeCalledTimes(0)
      expect(publishSqsMock).toBeCalledTimes(0)
    })

    it('command UPSERT saves timer to database if its more than 15 minutes in the future', async () => {
      getTimeDifferenceFromNowMock.mockReturnValue(1000)
      const event = createUpsertSQSEvent()

      await processCommand(event, context)

      expect(upsertTimerMock).toBeCalledWith(expect.anything(), {
        id: 'some-id',
        processed: false,
        time: '2022-07-22T23:53:31.218Z',
        url: 'some-url'
      })
      expect(publishSqsMock).toBeCalledTimes(0)
    })

    it('command UPSERT saves timer to database and adds to queue with delay if its less than 15 minutes in the future', async () => {
      getTimeDifferenceFromNowMock.mockReturnValue(500)
      const timer = {
        id: 'some-id',
        processed: true,
        time: '2022-07-22T23:53:31.218Z',
        url: 'some-url'
      }
      const event = createUpsertSQSEvent()

      await processCommand(event, context)

      expect(upsertTimerMock).toBeCalledWith(expect.anything(), timer)
      expect(publishSqsMock).toBeCalledWith(expect.anything(), 'APPLY', timer, 500)
    })
  })
})
