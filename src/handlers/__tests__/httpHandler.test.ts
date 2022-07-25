const publishMock = jest.fn()
jest.mock('../../AWS/sqsPublisher', () => {
  return {
    SqsPublisher: jest.fn().mockImplementation(() => {
      return {
        publish: publishMock,
      }
    }),
  }
})

const getTimerByIdMock = jest.fn()
jest.mock('../../services/timer.service', () => {
  return {
    TimerService: jest.fn().mockImplementation(() => {
      return {
        getTimerById: getTimerByIdMock,
      }
    }),
  }
})

import { getTimeDifferenceFromNow } from '../../utils/time.util'

jest.mock('../../utils/time.util')
const getTimeDifferenceFromNowMock = getTimeDifferenceFromNow as jest.MockedFunction<typeof getTimeDifferenceFromNow>

import type {APIGatewayProxyEvent} from 'aws-lambda'
import {DateTime, Settings} from 'luxon'
import {mocked} from 'ts-jest/utils'
import {v4} from 'uuid'

import {getTimer, postTimer} from '../httpHandler'

jest.mock('uuid')
const uuidV4Mock = mocked(v4)

function createPostTimerRequest(timerRequest: string, isBase64Encoded: boolean): APIGatewayProxyEvent {
  return {
    body: timerRequest,
    isBase64Encoded
  } as APIGatewayProxyEvent
}

function createGetTimerRequest(id: string): APIGatewayProxyEvent {
  return {
    pathParameters: {id},
  } as unknown as APIGatewayProxyEvent
}

describe('httpHandler', () => {

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('postTimer', () => {
    it('publishes event into sqs queue and returns 202', async () => {
      publishMock.mockReturnValue(true)
      uuidV4Mock.mockReturnValue('test-id')
      const expectedNow = DateTime.utc(2021, 6, 1, 23, 0, 0)
      Settings.now = (): number => expectedNow.toMillis()
      const buff = new Buffer(JSON.stringify({
        hours: '4',
        minutes: '0',
        seconds: '1',
        url: 'https://someserver.com'
      }))
      const base64data = buff.toString('base64')

      const result = await postTimer(createPostTimerRequest(base64data, true), expect.anything())

      expect(result.statusCode).toEqual(202)
      expect(JSON.parse(result.body)).toEqual({id: 'test-id'})
      expect(publishMock).toBeCalled()
    })

    it('publishes non base54 event data into sqs queue and returns 202', async () => {
      publishMock.mockReturnValue(true)
      uuidV4Mock.mockReturnValue('test-id')
      const expectedNow = DateTime.utc(2021, 6, 1, 23, 0, 0)
      Settings.now = (): number => expectedNow.toMillis()
      const data = JSON.stringify({
        hours: '4',
        minutes: '0',
        seconds: '1',
        url: 'https://someserver.com'
      })

      const result = await postTimer(createPostTimerRequest(data, false), expect.anything())

      expect(result.statusCode).toEqual(202)
      expect(JSON.parse(result.body)).toEqual({id: 'test-id'})
      expect(publishMock).toBeCalled()
    })

    it('does NOT publish event into sqs queue and returns 500', async () => {
      publishMock.mockReturnValue(false)
      uuidV4Mock.mockReturnValue('test-id')
      const expectedNow = DateTime.utc(2021, 6, 1, 23, 0, 0)
      Settings.now = (): number => expectedNow.toMillis()

      const buff = new Buffer(JSON.stringify({
        hours: '4',
        minutes: '0',
        seconds: '1',
        url: 'https://someserver.com'
      }))
      const base64data = buff.toString('base64')

      const result = await postTimer(createPostTimerRequest(base64data, true), expect.anything())

      expect(result.statusCode).toEqual(500)
      expect(publishMock).toBeCalled()
    })

    it('does NOT publish event into sqs queue and returns 400 when request has no body', async () => {
      const emptyBodyEvent = {} as APIGatewayProxyEvent

      const result = await postTimer(emptyBodyEvent, expect.anything())

      expect(result.statusCode).toEqual(400)
      expect(publishMock).not.toBeCalled()
    })

    it('does NOT publish event into sqs queue and returns 400 when request has no valid body', async () => {
      const buff = new Buffer(JSON.stringify({hours: '4', minutes: '0', url: 'https://someserver.com'}))
      const base64data = buff.toString('base64')

      const result = await postTimer(createPostTimerRequest(base64data, true), expect.anything())

      expect(result.statusCode).toEqual(422)
      expect(publishMock).not.toBeCalled()
    })
  })

  describe('getTimer', () => {
    it('successfully gets timer and returns 200', async () => {
      const timer = {
        id: 'some-id',
        time: 'some-time',
        url: 'some-url',
        processed: false
      }
      getTimerByIdMock.mockReturnValue(timer)
      getTimeDifferenceFromNowMock.mockReturnValue(400)

      const result = await getTimer(createGetTimerRequest('some-id'), expect.anything())

      expect(result.statusCode).toEqual(200)
      // eslint-disable-next-line
      expect(JSON.parse(result.body)).toEqual({id: 'some-id', time_left: 400})
    })

    it('unsuccessfully gets timer and returns 404', async () => {
      getTimerByIdMock.mockReturnValue(undefined)

      const result = await getTimer(createGetTimerRequest('some-id'), expect.anything())

      expect(result.statusCode).toEqual(404)
    })
  })
})
