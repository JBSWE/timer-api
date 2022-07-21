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

import type { APIGatewayProxyEvent } from 'aws-lambda'
import { DateTime, Settings } from 'luxon'
import { mocked } from 'ts-jest/utils'
import { v4 } from 'uuid'

import { postTimer } from '../httpHandler'

jest.mock('uuid')
const uuidV4Mock = mocked(v4)

function createTimerRequest(timerRequest: string): APIGatewayProxyEvent {
  return {
    body: timerRequest,
  } as APIGatewayProxyEvent
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

      const result = await postTimer(createTimerRequest(base64data), expect.anything())

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

      const result = await postTimer(createTimerRequest(base64data), expect.anything())

      expect(result.statusCode).toEqual(500)
      expect(publishMock).toBeCalled()
    })

    it('does NOT publish event into sqs queue and returns 400 when request has no body', async () => {
      const emptyBodyEvent = {} as APIGatewayProxyEvent

      const result = await postTimer(emptyBodyEvent, expect.anything())

      expect(result.statusCode).toEqual(400)
      expect(publishMock).not.toBeCalled()
    })

    it('does NOT publish event into sqs queue and returns 400 when request has no body', async () => {
      const buff = new Buffer(JSON.stringify({hours: '4', minutes: '0', url: 'https://someserver.com'}))
      const base64data = buff.toString('base64')

      const result = await postTimer(createTimerRequest(base64data), expect.anything())

      expect(result.statusCode).toEqual(422)
      expect(publishMock).not.toBeCalled()
    })

  })
})
