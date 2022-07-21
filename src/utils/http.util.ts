import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import type { Timer } from '../models'

export function makeAcceptedHttpResponse(result: Timer): APIGatewayProxyResult {
  return {
    statusCode: 202,
    body: JSON.stringify({id: result.id}),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  }
}

export function makeErrorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    body: JSON.stringify({ error: message }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  }
}

export function getCorrelationIdFromHttpRequest(event: APIGatewayProxyEvent): string | undefined {
  return event?.headers?.['x-correlation-id'] as string ?? undefined
}
