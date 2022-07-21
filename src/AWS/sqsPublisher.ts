import { SQS } from 'aws-sdk'
import type { SendMessageRequest } from 'aws-sdk/clients/sqs'

import type { TimerContext } from '../models'
import type { Command } from '../models/command.model'
import type { SqsRequest } from '../models/sqsRequest.model'
import type { Timer } from '../models/timer.model'

export class SqsPublisher {
  private client: SQS
  constructor(private sqsQueueUrl: string) {
    this.client = new SQS()
  }

  async publish(
    timerContext: TimerContext,
    command: Command,
    item: Timer,
    delay = 0
  ): Promise<boolean> {
    const sqsRequest: SqsRequest = {
      data: item,
      meta: {
        command,
        correlationId: timerContext.correlationId,
      },
    }

    const params = {
      MessageBody: JSON.stringify(sqsRequest),
      QueueUrl: this.sqsQueueUrl,
      DelaySeconds: delay,
    } as SendMessageRequest

    try {
      await this.client.sendMessage(params).promise()
      timerContext.logger.info('Queued %o with delay %s', item, delay)
    } catch (e) {
      timerContext.logger.warn(e, `Could not publish message to SQS ${this.sqsQueueUrl}.`)
      return false
    }

    return true
  }
}
