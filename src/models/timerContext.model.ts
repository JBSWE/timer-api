import type { BaseLogger } from 'pino'

export interface TimerContext {
  correlationId: string
  logger: BaseLogger
}
