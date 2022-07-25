import type { APIGatewayProxyEvent, SQSEvent } from 'aws-lambda'

import type { SqsRequest, Timer } from '../../models'
import { Command } from '../../models'
import {
  createContextForHttpRequest, createContextForScheduleHandler, createContextForSqsEvent,
} from '../createContext.util'

describe('createContext', () => {
  const lambdaContext = {
    authorizer: {
      userRoles: ['test'],
    },
    awsRequestId: 'test',
  }
  describe('createContextForHttpRequest', () => {
    it('should return context with corrId from http header', () => {
      const httpRequest = {
        headers: {
          'x-correlation-id': 'some-upstream-service-uuid',
        },
      } as unknown as APIGatewayProxyEvent

      const context = createContextForHttpRequest(httpRequest, lambdaContext)

      expect(context.correlationId).toContain('some-upstream-service-uuid')
    })
  })

  describe('createContextForSqsEvent', () => {
    function createSqsEvent(event: SqsRequest): SQSEvent {
      return {
        Records: [
          {
            body: JSON.stringify(event),
          },
        ],
      } as SQSEvent
    }

    it('should return default context if meta information is not set in sqs event', () => {
      const sqsEvent = createSqsEvent({
        data: {
          hours: '4',
          minutes: '0',
          seconds: '1',
          url: 'https://someserver.com'
        } as unknown as Timer,
      })

      const context = createContextForSqsEvent(sqsEvent, lambdaContext)

      expect(context.correlationId).toContain('timer-api')
    })

    it('should return context with meta information', () => {
      const sqsEvent = createSqsEvent({
        data: {
          hours: '4',
          minutes: '0',
          seconds: '1',
          url: 'https://someserver.com'
        } as unknown as Timer,
        meta: {
          command: Command.APPLY,
          correlationId: 'some-upstream-service-uuid',
        },
      })

      const context = createContextForSqsEvent(sqsEvent, lambdaContext)

      expect(context.correlationId).toContain('some-upstream-service-uuid')
    })
  })

  describe('createContextForScheduleHandler', () => {
    it('should return context with corrId from http header', () => {

      const context = createContextForScheduleHandler(lambdaContext)

      expect(context.correlationId).toContain('timer-api')
    })
  })
})
