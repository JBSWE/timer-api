import type { Command } from './command.model'
import type { Timer } from './timer.model'

export interface SqsRequest {
  data?: Timer
  meta?: SqsMetaInformation
}

export interface SqsMetaInformation {
  command: Command
  correlationId: string
}

