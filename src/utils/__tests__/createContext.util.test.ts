import type { APIGatewayProxyEvent } from 'aws-lambda'

import {
  createContextForHttpRequest,
} from '../createContext.util'

describe('createContext', () => {
    it('should return context with corrId from http header', () => {
      const lambdaContext = {
        authorizer: {
          userRoles: ['test'],
        },
        awsRequestId: 'test',
      }
      const httpRequest = {
        headers: {
          'x-correlation-id': 'some-upstream-service-uuid',
        },
      } as unknown as APIGatewayProxyEvent

      const context = createContextForHttpRequest(httpRequest, lambdaContext)

      expect(context.correlationId).toContain('some-upstream-service-uuid')
    })
})
