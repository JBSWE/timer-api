import type { APIGatewayProxyEvent } from 'aws-lambda'

import {
  getCorrelationIdFromHttpRequest,
  makeAcceptedHttpResponse,
  makeErrorResponse,
  makeOkHttpResponse
} from '../http.util'

describe('http.util', () => {

  describe('getCorrelationIdFromHttpRequest', () => {
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

  describe('makeAcceptedHttpResponse', () => {
    it('should return timer id with response 202 accepted', () => {
      const timer = {
        id: 'some-id',
        time: 'some-time',
        url: 'some-url',
        processed: 'false'
      }

      const response = makeAcceptedHttpResponse(timer)

      expect(response).toEqual(
        {
          body: '{"id":"some-id"}',
          headers:
            {
              'Access-Control-Allow-Credentials': true,
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
          statusCode: 202
        })
    })
  })

  describe('makeOkHttpResponse', () => {
    it('should return timer id with response 200 accepted', () => {
      const timer = {
        id: 'some-id',
        time: 'some-time',
        url: 'some-url',
        processed: 'false'
      }

      const response = makeOkHttpResponse(timer, 400)

      expect(response).toEqual(
        {
          body: JSON.stringify(
            {
              id: timer.id,
              // eslint-disable-next-line
              time_left: 400
            }
          ),
          headers:
            {
              'Access-Control-Allow-Credentials': true,
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
          statusCode: 200
        })
    })
  })

  describe('makeErrorResponse', () => {
    it('should return error', () => {

      const response = makeErrorResponse(404, 'Not found')

      expect(response).toEqual({
        body: '{"error":"Not found"}',
        headers: {
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        statusCode: 404
      })
    })
  })

})
