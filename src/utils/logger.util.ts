import type { BaseLogger, LoggerOptions } from 'pino'
import { pino } from 'pino'

import type { ProcessEnv } from '../config'
import { getString } from '../config'
import type { LambdaRequestContext, LoggerContext } from '../models'

const pinoDefaultConfig: LoggerOptions = {
  formatters: {
    level(label): object {
      return { level: label }
    },
  },
  level: getString('LOG_LEVEL' as ProcessEnv),
  messageKey: 'message',
}

const parentLogger = pino(pinoDefaultConfig)

function createLogger(context: LoggerContext): BaseLogger {
  return parentLogger.child({
    ...context,
  })
}

export function createLoggerForAwsLambda(
  awsContext: LambdaRequestContext,
  correlationId?: string,
): BaseLogger {
  const context = {
    requestId: awsContext.awsRequestId,
    correlationId: correlationId,
  }
  return createLogger(context)
}
