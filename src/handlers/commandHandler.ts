import type { SQSEvent } from 'aws-lambda'

import type { LambdaRequestContext } from '../models'

export async function processCommand(event: SQSEvent, context: LambdaRequestContext): Promise<boolean> {
  if(!event || !context) {
    return false
  }
  return true
}
