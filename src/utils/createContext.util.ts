import type { APIGatewayProxyEvent } from 'aws-lambda'

import type { LambdaRequestContext } from '../models'
import type { TimerContext } from '../models/timerContext.model'
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
