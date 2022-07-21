import type { APIGatewayProxyEvent } from 'aws-lambda'

import type { LambdaRequestContext } from '../models'
import { createContextForHttpRequest } from '../utils/createContext.util'

export async function postTimer(event: APIGatewayProxyEvent, context: LambdaRequestContext): Promise<boolean> {
  const timerContext = createContextForHttpRequest(event, context)

  if(!event.body) {
    return false
  }

  const decodedJsonObject = Buffer.from(event.body, 'base64').toString('ascii')
  const data = JSON.parse(decodedJsonObject)

  timerContext.logger.info(
    'Received valid POST requests',
    data
  )

  return true
}
