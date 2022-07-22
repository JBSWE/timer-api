import type { APIGatewayProxyEvent, SQSEvent } from 'aws-lambda'

import type { LambdaRequestContext } from '../models'
import type { TimerContext } from '../models'
import { extendCorrelationId } from './correlationId.util'
import { getCorrelationIdFromHttpRequest } from './http.util'
import { createLoggerForAwsLambda } from './logger.util'

export function createContextForHttpRequest(
  httpRequest: APIGatewayProxyEvent,
  context: LambdaRequestContext
): TimerContext {
  const correlationId = getCorrelationIdFromHttpRequest(httpRequest)
  const extendedCorrelationIds = extendCorrelationId(correlationId)
  const logger = createLoggerForAwsLambda(context, extendedCorrelationIds)

  return {
    correlationId: extendedCorrelationIds,
    logger: logger,
  }
}

export function createContextForSqsEvent(event: SQSEvent, context: LambdaRequestContext): TimerContext {
  const metaInformation = JSON.parse(event.Records[0].body).meta
  const correlationId = metaInformation?.correlationId ?? extendCorrelationId(undefined)
  const logger = createLoggerForAwsLambda(context, correlationId)
  return {
    correlationId: correlationId,
    logger: logger,
  }
}
