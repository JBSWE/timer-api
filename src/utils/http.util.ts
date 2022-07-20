import type { APIGatewayProxyEvent } from 'aws-lambda'

export function getCorrelationIdFromHttpRequest(event: APIGatewayProxyEvent): string | undefined {
  return event?.headers?.['x-correlation-id'] as string ?? undefined
}
