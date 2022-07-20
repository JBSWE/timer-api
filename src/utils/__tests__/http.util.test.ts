import type { APIGatewayProxyEvent } from 'aws-lambda'

import { getCorrelationIdFromHttpRequest } from '../http.util'

describe('http.util', () => {
    it('should return correlation id from headers', () => {
      const event = {
        headers: {
          'x-correlation-id':
            'timer-api-af049fe3-aa54-4e0d-94fb-121f62eaf6e4,gql-sdk-af049fe3-aa54-4e0d-94fb-121f62eaf123',
        },
      } as unknown as APIGatewayProxyEvent

      const consumerName = getCorrelationIdFromHttpRequest(event)

      expect(consumerName).toEqual(
        'timer-api-af049fe3-aa54-4e0d-94fb-121f62eaf6e4,gql-sdk-af049fe3-aa54-4e0d-94fb-121f62eaf123'
      )
    })

    it('should return undefined if custom header for correlation id is not set', () => {
      const event = {} as unknown as APIGatewayProxyEvent

      const consumerName = getCorrelationIdFromHttpRequest(event)

      expect(consumerName).toEqual(undefined)
    })
})
